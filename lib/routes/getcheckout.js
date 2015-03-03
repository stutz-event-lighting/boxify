var mongo = require("mongodb");
var async = require("async");
var util = require("../util.js");
module.exports = function(req,res){
    var projectid = mongo.ObjectID(req.params.project);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmentcategories").find({},{name:true}).toArray(cb)
        },
        function(cb){
            req.app.db.collection("equipmenttypes").find({},{name:true,category:true,count:true}).toArray(cb)
        },
        function(cb){
            req.app.db.collection("projects").findOne({_id:projectid},{start:true,end:true},function(err,project){
                if(err || !project) return cb(err||new Error("Project does not exist!"));
                req.app.db.collection("projects").find({start:{$lte:project.start},end:{$gte:project.end}},{_id:true,start:true,end:true}).toArray(function(err,projects){
                    if(err) cb(err);
                    var projectids = projects.map(function(project){return project._id});
                    async.parallel([
                        function(cb){
                            req.app.db.collection("equipmentreservations").find({project:{$in:projectids}},{items:true,project:true}).toArray(cb)
                        },
                        function(cb){
                            req.app.db.collection("equipmentrentals").find({project:{$in:projectids}},{items:true,project:true}).toArray(cb)
                        },
                        function(cb){
                            req.app.db.collection("equipmentcheckouts").find({project:{$in:projectids}},{items:true,project:true}).toArray(cb)
                        },
                        function(cb){
                            req.app.db.collection("equipmentcheckins").find({project:{$in:projectids}},{items:true,project:true}).toArray(cb)
                        }
                    ],function(err,results){
                        if(err) return cb(err);
                        cb(null,[projects].concat(results));
                    });
                });
            })
        }
    ],function(err,results){
        if(err) return res.fail();
        var categories = util.createIndex(results[0],"_id");
        var types = util.createIndex(results[1],"_id");
        var projects = results[2][0];
        var reservations = results[2][1];
        var rentals = results[2][2];
        var checkouts = results[2][3];
        var checkins = results[2][4];

        //rename the 'count' property to 'available'
        for(var type in types){
            type = types[type];
            type.available = type.count;
            delete type.count;
            type.suppliers = {};
        }

        //1) calculate the current stock by taking the current stock of every type, substracting all checkouts and adding all checkins
        console.log(checkouts,checkins);
        var checks = checkouts.map(function(checkout){checkout.type = "checkout";return checkout}).concat(checkins);
        for(var i = 0; i < checks.length; i++){
            var check = checks[i];
            //if it is the current checkout, set it as count, and not as available
            if(check._id+"" == req.params.checkout){
                for(var type in check.items){
                    types[type].count = check.items[type].count;
                }
            }else{
                for(var type in check.items){
                    types[type].available += check.items[type].count*(check.type=="checkout"?-1:1);
                }
            }
        }

        //2) calculate usage for every type in every project by substractring all reservations & adding all rentals
        var projectsbyid = {};
        for(var i = 0; i < projects.length; i++){
            var project = projects[i];
            project.types = {};
            projectsbyid[project._id+""] = project;
        }

        console.log(projectsbyid);

        for(var i = 0; i < reservations.length; i++){
            var reservation = reservations[i];
            var project = projectsbyid[reservation.project+""];
            //if we prepare the checkout for this reservation, don't count it and instead mark the items as needed
            if(reservation._id+"" == req.params.reservation){
                for(var type in reservation.items){
                    types[type].needed = reservation.items[type];
                }
            //if the checkout is for the current project, directly subtract it from the available types
            }else if(project._id+"" == req.params.project){
                for(var typeid in reservation.items){
                    var type = types[typeid];
                    type.available -= reservation.items[typeid];
                }
            }else{
                for(var type in reservation.items){
                    if(project.types[type] == undefined) project.types[type] = 0;
                    project.types[type] += reservation.items[type];
                }
            }
        }

        for(var i = 0; i < rentals.length; i++){
            var rental = rentals[i];
            var project = projectsbyid[rental.project+""];
            //if the rental is for the current project, directly add the items to the available types
            if(project._id+"" == req.params.project){
                var supplier = rental.supplier+"";
                for(var typeid in rental.items){
                    var type = types[typeid];
                    if(type.suppliers[supplier] === undefined) type.suppliers[supplier] = {available:0};
                    type.suppliers[supplier].available += rental.items[typeid];
                    type.available += rental.items[typeid];
                }
            }else{
                for(var type in rental.items){
                    if(project.types[type] == undefined) project.types[type] = 0;
                    project.types[type] -= rental.items[type];
                }
            }
        }

        console.log(types);
        console.log("PROJECT",req.params.project);
        console.log("CHECKOUT",req.params.checkout);
        console.log("RESERVATION",req.params.reservation);

        //3) create types timeline out of all projects
        var timeline = {};
        for(var i = 0; i < projects.length; i++){
            var project = projects[i];
            if(project._id+"" == req.params.project) continue;
            console.log(project._id+"","!=",req.params.project)
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
        console.log(timeline);
        timeline = Object.keys(timeline).map(function(time){return parseFloat(time)}).sort().map(function(time){return timeline[time]});
        console.log(timeline);

        //4) find the lowest count for every type in the timeline
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

        /*5) calculate the available count for every type & supplier, by taking the counts calulated in 1) and substracting values from 4),
             then adding all rentals of the project */
        for(var type in max){
            types[type].available -= max[type];
        }



        //calculate own property for every type
        for(var type in types){
            type = types[type];
            var own = type.count;
            for(var supplier in type.suppliers){
                own -= type.suppliers[supplier];
            }
            type.suppliers.own = own;
        }

        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({
            categories:categories,
            types:types
        }));
    });
}
