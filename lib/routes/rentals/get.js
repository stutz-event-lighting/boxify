var mongo = require("mongodb");
var async = require("async");
var util = require("../../util.js");

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
            req.app.db.collection("equipmentrentals").findOne({_id:mongo.ObjectID(req.params.rental)},{name:true,items:true,status:true},function(err,rental){
                if(err || !rental) return cb(err);
                req.app.db.collection("contacts").findOne({_id:rental.supplier},{name:true},function(err,supplier){
                    if(err || !supplier) return cb(err);
                    rental.supplier = {value:rental.supplier,label:supplier.name};
                    cb(null,rental);
                });
            });
        }
    ],function(err,results){
        if(err) return res.fail();
        var types = util.createIndex(results[0],"_id");
        var categories = util.createIndex(results[1],"_id");
        var rental = results[2];

        if(rental){
            for(var type in rental.items){
                types[type].count = rental.items[type].count;
                types[type].ids = rental.items[type].ids;
            }
            delete rental.items;
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
