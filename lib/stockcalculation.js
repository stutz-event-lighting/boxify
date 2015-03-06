var async = require("async");
var util = require("./util.js");

var StockCalculation = module.exports = function StockCalculation(db){
    this.db = db;
}

StockCalculation.prototype = {
    load:function(project,typefields,cb){
        this.project = project;
        var typequery = {name:true,count:true};
        for(var field in typefields){
            typequery[field] = typefields[field];;
        }

        var self = this;
        async.parallel([
            function(cb){
                self.db.collection("equipmenttypes").find({},typequery).toArray(cb)
            },
            function(cb){
                self.db.collection("projects").findOne({_id:self.project},{start:true,end:true},function(err,project){
                    if(err || !project) return cb(err||new Error("Project does not exist!"));
                    self.db.collection("projects").find({start:{$lte:project.start},end:{$gte:project.end}},{_id:true,start:true,end:true}).toArray(function(err,projects){
                        if(err) cb(err);
                        var projectids = projects.map(function(project){return project._id});
                        async.parallel([
                            function(cb){
                                self.db.collection("equipmentreservations").find({project:{$in:projectids}},{items:true,project:true}).toArray(cb)
                            },
                            function(cb){
                                self.db.collection("equipmentrentals").find({project:{$in:projectids}},{items:true,project:true}).toArray(cb)
                            },
                            function(cb){
                                self.db.collection("equipmentcheckouts").find({project:{$in:projectids}},{items:true,project:true}).toArray(cb)
                            },
                            function(cb){
                                self.db.collection("equipmentcheckins").find({project:{$in:projectids}},{items:true,project:true}).toArray(cb)
                            }
                        ],function(err,results){
                            if(err) return cb(err);
                            cb(null,[projects].concat(results));
                        });
                    });
                })
            }
        ],function(err,results){
            this.types = util.createIndex(results[0],"_id");
            this.projects = results[1][0];
            this.reservations = results[1][1];
            this.rentals = results[1][2];
            this.checkouts = results[1][3];
            this.checkins = results[1][4];
            cb();
        }.bind(this));
    },
    init:function(){
        for(var type in this.types){
            type = this.types[type];
            type.available = type.count;
            delete type.count;
            type.suppliers = {};
        }
    },
    calculateStock:function(ignore){
        var checks = this.checkouts.map(function(checkout){checkout.type = "checkout";return checkout}).concat(this.checkins);
        for(var i = 0; i < checks.length; i++){
            var check = checks[i];
            //if it is the current checkout, set it as count, and not as available
            if(check._id+"" == ignore){
                for(var type in check.items){
                    this.types[type].count = check.items[type].count;
                }
            }else{
                for(var type in check.items){
                    this.types[type].available += check.items[type].count*(check.type=="checkout"?-1:1);
                }
            }
        }
    },
    calculateTimeline:function(ignore,needed){
        var projectsbyid = {};
        for(var i = 0; i < this.projects.length; i++){
            var project = this.projects[i];
            project.types = {};
            projectsbyid[project._id+""] = project;
        }

        //group reservations together by project
        for(var i = 0; i < this.reservations.length; i++){
            var reservation = this.reservations[i];

            //if we calculate for a checkout based on this reservation, don't count it and instead mark the items as needed
            if(reservation._id+"" == needed){
                for(var type in reservation.items){
                    this.types[type].needed = reservation.items[type];
                }
            //if we calculate for this reservation, ignore it and insteand add it to the types count property
            }else if(reservation._id+"" == ignore){
                for(var type in reservation.items){
                    this.types[type].count = reservation.items[type];
                }
            //if we calculate for this project, directly subtract it from the available types
            }else if(project._id+"" == (this.project+"")){
                for(var typeid in reservation.items){
                    var type = this.types[typeid];
                    type.available -= reservation.items[typeid];
                }
            //otherwise add it to the projects's type total
            }else{
                var project = projectsbyid[reservation.project+""];
                for(var type in reservation.items){
                    if(project.types[type] == undefined) project.types[type] = 0;
                    project.types[type] += reservation.items[type];
                }
            }
        }

        //group rentals together by project
        for(var i = 0; i < this.rentals.length; i++){
            var rental = this.rentals[i];

            //if we calculate for this reservation, ignore it and insteand add it to the types count property
            if(rental._id+"" == ignore){
                for(var type in rental.items){
                    this.types[type].count = rental.items[type];
                }
            //if we calculate for this project, directly add it to the available types
        }else if(project._id+"" == (this.project+"")){
                var supplier = rental.supplier+"";
                for(var typeid in rental.items){
                    var type = this.types[typeid];
                    if(type.suppliers[supplier] === undefined) type.suppliers[supplier] = {available:0};
                    type.suppliers[supplier].available += rental.items[typeid];
                    type.available += rental.items[typeid];
                }
            //otherwise add it to the projects's type total
            }else{
                var project = projectsbyid[rental.project+""];
                for(var type in rental.items){
                    if(project.types[type] == undefined) project.types[type] = 0;
                    project.types[type] -= rental.items[type];
                }
            }
        }

        //create timeline out of all projects
        var timeline = {};
        for(var i = 0; i < this.projects.length; i++){
            var project = this.projects[i];
            if(project._id+"" == (this.project+"")) continue;
            var start = timeline[project.start];
            if(!start) timeline[project.start] = start = {};
            var end = timeline[project.end];
            if(!end) timeline[project.end] = end = {};
            for(var type in project.types){
                if(start[type] === undefined) start[type] = 0;
                start[type] += project.types[type];
                if(end[type] === undefined) end[type] = 0;
                end[type] -= project.types[type];
            }
        }
        timeline = Object.keys(timeline).map(function(time){return parseFloat(time)}).sort().map(function(time){return timeline[time]});

        //find the lowest count for every type in the timeline
        if(timeline.length){
            var max = JSON.parse(JSON.stringify(timeline[0]));
            var current = timeline[0];
            for(var i = 1; i < timeline.length; i++){
                var time = timeline[i];
                for(var type in time){
                    current[type] += time[type];
                }
                for(var type in current){
                    if(!max[type] || current[type] > max[type]){
                        max[type] = current[type];
                    }
                }
            }
        }else{
            var max = {};
        }

        // substract the max of the timeline from the available items, since they are needed by other projects in the future
        for(var type in max){
            this.types[type].available -= max[type];
        }

        //calculate own property for every type
        for(var type in this.types){
            type = this.types[type];
            var own = type.count;
            for(var supplier in type.suppliers){
                own -= type.suppliers[supplier];
            }
            type.suppliers.own = own;
        }
    },
    calculateAvailableItemsForReservation:function(reservation){
        this.init();
        this.calculateStock()
        this.calculateTimeline(reservation);
    },
    calculateNeededItemsForRental:function(rental){
        this.init();
        this.calculateStock();
        this.calculateTimeline(rental);
    },
    calculateAvailableItemsForCheckout:function(checkout,reservation){
        this.init();
        this.calculateStock(checkout);
        this.calculateTimeline(null,reservation);
    }
}
