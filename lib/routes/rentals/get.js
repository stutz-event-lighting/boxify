var mongo = require("mongodb");
var async = require("async");
var util = require("../../util.js");
var calcNeeded = require("../projects/calculateneeded.js");

module.exports = function(req,res){
    async.parallel([
        function(cb){
            req.app.db.collection("equipmenttypes").find({},{name:true,category:true}).toArray(cb)
        },
        function(cb){
            req.app.db.collection("equipmentcategories").find({},{name:true}).toArray(cb)
        },
        function(cb){
            if(["newrequest","newbooking","newrental"].indexOf(req.params.rental) >= 0) return cb();
            req.app.db.collection("equipmentrentals").findOne({_id:mongo.ObjectID(req.params.rental)},{name:true,items:true,status:true,supplier:true},cb);
        },
        function(cb){
            if(!req.query.project) return cb();
            async.parallel([
                function(cb){
                    req.app.db.collection("projects").findOne({_id:mongo.ObjectID(req.query.project)},{start:true,end:true},cb)
                },
                function(cb){
                    calcNeeded(req.app.db,mongo.ObjectID(req.query.project),cb);
                }
            ],function(err,results){
                if(err) return cb(err);
                results[0].needed = results[1];
                cb(null,results[0]);
            })

        }

    ],function(err,results){
        if(err) return res.fail();
        var types = util.createIndex(results[0],"_id");
        var categories = util.createIndex(results[1],"_id");
        var rental = results[2];
        var project = results[3];

        if(rental){
            for(var type in rental.items){
                types[type].count = rental.items[type].count;
                types[type].ids = rental.items[type].ids;
            }
            delete rental.items;
        }else if(project){
            for(var type in project.needed){
                if(project.needed[type] <= 0) continue;
                types[type].count = project.needed[type];
                types[type].ids = [];
            }
            rental = {
                delivery:project.start,
                return:project.end,
                status:"requested"
            };
        }

        //implement a logic where the 'count' property gets calculated for every type,
        //if there is a 'project' parameter given to this route

        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({
            types:types,
            categories:categories,
            rental:rental
        }));
    });
}
