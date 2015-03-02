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
                req.app.db.collection("projects").find({start:{$lte:project.start},end:{$gte:project.end}},{_id:true,start:true,end:true}).toArray(err,projects){
                    var projects = projects.map(function(project){return project._id});
                    async.parallel([
                        function(cb){
                            req.app.db.collection("equipmentreservations").find({project:{$in:projects}},{items:true},cb)
                        },
                        function(cb){
                            req.app.db.collection("equipmentrentals").find({project:{$in:projects}},{items:true},cb)
                        }
                        function(cb){
                            req.app.db.collection("equipmentcheckouts").find({project:{$in:projects}},{items:true},cb)
                        },
                        function(cb){
                            req.app.db.collection("equipmentcheckins").find({project:{$in:projects}},{items:true},cb)
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
        
        //1) calculate the current stock by taking the current stock of every type, substracting all checkouts and adding all checkins
        var checks = checkouts.map(function(checkout){checkout.type = "checkout";return checkout}).concat(checkins);
        for(var i = 0; i < checks.length; i++){
            var check = checks[i];
            for(var j = 0; j < check.items.length; j++){
                var item = check.items[j];
                var type = types[item.type];
                type.count += item.count*(check.type=="checkout"?-1:1);
            }
        }
        
        //2) calculate usage for every type in every project by substractring all reservations & adding all rentals
        var projectsbyid = {};
        for(var i = 0; i < projects.length; i++){
            var project = projects[i];
            project.types = {};
            projectsbyid[project._id+""] = project;
        }        
        
        for(var i = 0; i < reservations.length; i++){
            var reservation = reservations[i];
            var project = projectsbyid[reservation.project+""];
            for(var j = 0; j < reservation.items.length; j++){
                var item = reservation.items[j];
                var type = project.types[item.type];
                if(project.types[item.type] == undefined) project.types[item.type] = 0;
                project.types[item.type] += item.count;
            }
        }
        
        for(var i = 0; i < rentals.length; i++){
            var rental = rentals[i];
            var project = projectsbyid[rental.project+""];
            for(var j = 0; j < rental.items.length; j++){
                var item = rental.items[j];
                if(project.types[item.type] == undefined) project.types[item.type] = 0;
                project.types[item.type] -= item.count;
            }
        }
        
        //3) create types timeline out of all projects
        var timeline = {};
        for(var i = 0; i < projects.length; i++){
            var project = projects[i];
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
            types[type].count -= max[type];
        }
        var projectrentals = rentals.filter(function(rental){return rental.project+"" == projectid+""})
        for(var i = 0; i < projectrentals.length; i++){
            var rental = projectrentals[i];
            var supplier = rental.supplier+"";
            for(var j = 0; j < rental.items.length; j++){
                var item = rental.items[j];
                var type = types[item.type];
                if(!type.suppliers) type.suppliers = {};
                if(type.suppliers[supplier] === undefined) type.suppliers[supplier] = 0;
                type.suppliers[supplier] += item.count;
                type.count += item.count;
            }
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




/*output format

{
    categories:[{
        _id:        ObjectID,
        name:       String
    }],
    types:{
        TYPEID:{
            _id :       ObjectID,
            name:       String,
            category:   ObjectID,
            count:      Number,
            suppliers:{
                SUPPLIERID: Number
            }
        }
    }
}
*/
