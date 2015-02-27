var mongo = require("mongodb");
var async = require("async");
var util = require("../util.js");
module.exports = function(req,res){
    async.parallel([
        function(cb){
            req.app.db.collection("equipmentcategories").find({},{name:true}).toArray(cb)
        },
        function(cb){
            req.app.db.collection("equipmenttypes").find({},{name:true,category:true,count:true}).toArray(cb)
        },
        function(cb){
            req.app.db.collection("projects").findOne({_id:mongo.ObjectID(req.params.project)},{start:true,end:true},function(err,project){
                if(err || !project) return cb(err||new Error("Project does not exist!"));
                req.app.db.collection("projects").find({begin:{$lte:project.start},end:{$gte:project.end}},{_id:true}).toArray(err,projects){
                    var projects = projects.map(function(project){return project._id});
                    async.parallel([
                        function(cb){
                            req.app.db.collection("equipmentreservations").find({project:{$in:projects}},{items:true},cb)
                        },
                        function(cb){
                            req.app.db.collection("equipmentrentals").find({project:{$in:projects}},{items:true},cb)
                        }
                        function(cb){
                            req.app.db.collection("equipmentcheckouts").find({project:{$in:projects},_id:{$ne:mongo.ObjectID(req.params.checkout)}},{items:true},cb)
                        },
                        function(cb){
                            req.app.db.collection("equipmentcheckins").find({project:{$in:projects}},{items:true},cb)
                        }
                    ],cb);
                });
            })
        },
        function(cb){
            req.app.db.collection("equipmentcheckouts").findOne({_id:mongo.ObjectID(req.params.checkout)},{checklist:true,items:true},cb)
        }
    ],function(err,results){
        if(err) return res.fail();
        var categories = util.createIndex(results[0],"_id");
        var types = util.createIndex(results[1],"_id");
        var reservations = results[2][0];
        var rentals = results[2][1];
        var checkouts = results[2][2];
        var checkins = results[2][3];
        var checkout = results[3];

        var checks = checkouts.map(function(checkout){checkout.type = "checkout";return checkout}).concat(checkins);

        for(var type in types){
            types[type].suppliers = {};
        }

        for(var i = 0; i < reservations.length; i++){
            var reservation = reservations[i];
            for(var j = 0; j < reservation.items.length; j++){
                var item = reservation.items[j];
                types[item.type] -= item.count;
            }
        }

        for(var i = 0; i < rentals.length; i++){
            var rental = rentals[i];
            for(var j = 0; j < rental.items.length; j++){
                var item = rental.items[j];
                var type = types[item.type];
                if(!type.suppliers[rental.supplier+""]) type.suppliers[rental.supplier+""] = 0;
                type.suppliers[rental.supplier+""] += item.count;
                type.count += item.count;
            }
        }

        for(var i = 0; i < checks.length; i++){
            var check = checks[i];
            for(var j = 0; j < check.items; j++){
                var item = check.items[j];
                for(var y = 0; y <item.suppliers.length; y++){
                    var supplier = item.suppliers[y];
                    var type = types[item.type];
                    type.count += supplier.count*(check.type=="checkout"?-1:1);
                    if(supplier._id){
                        type.suppliers[supplier._id+""] += supplier.count*(check.type=="checkout"?-1:1);
                    }
                }
            }
        }

        for(var type in types){
            type = types[type];
            var own = type.count;
            for(var supplier in type.suppliers){
                own -= type.suppliers[supplier];
            }
            type.suppliers.own = own;
        }

        //calculate checkout here

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
