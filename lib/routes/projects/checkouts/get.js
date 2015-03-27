var mongo = require("mongodb");
var async = require("async");
var util = require("../../../util.js");
var calcBalance = require("../../equipment/calculatebalance.js");


module.exports = function(req,res){
    var projectid = mongo.ObjectID(req.params.project);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmentcategories").find({},{name:true}).toArray(cb)
        },
        function(cb){
            req.app.db.collection("equipmenttypes").find({},{name:true,category:true}).toArray(cb);
        },
        function(cb){
            calcBalance(req.app.db,cb)
        },
        function(cb){
            if(req.params.checkout == "new") return cb();
            req.app.db.collection("equipmentio").findOne({_id:mongo.ObjectID(req.params.checkout)},{items:true},cb)
        },
        function(cb){
            if(!req.query.reservation) return cb();
            req.app.db.collection("equipmentreservations").findOne({_id:mongo.ObjectID(req.query.reservation)},{items:true},cb)
        }
    ],function(err,results){
        if(err) return res.fail();
        var categories = util.createIndex(results[0],"_id");
        var types = util.createIndex(results[1],"_id");
        var balance = results[2];
        var checkout = results[3];
        var reservation = results[4];
        var items;

        if(checkout){
            items = checkout.items;
        }

        for(var type in balance){
            types[type].available = balance[type].count;
            if(items && items[type]){
                types[type].count = items[type].count;
                types[type].available += types[type].count;
            }
            if(reservation && reservation.items[type]){
                types[type].needed = reservation.items[type];
            }
            types[type].suppliers = {};
            for(var supplier in balance[type].suppliers){
                types[type].suppliers[supplier] = {available:balance[type].suppliers[supplier]}
                if(items && items[type] && items[type].suppliers[supplier]){
                    types[type].suppliers[supplier].count = items[type].suppliers[supplier].count;
                    types[type].suppliers[supplier].available += items[type].suppliers[supplier].count;
                    if(items[type].suppliers[supplier].ids) types[type].suppliers[supplier].ids = items[type].suppliers[supplier].ids;
                }
            }
        }
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({
            categories:categories,
            types:types
        }));
    });
}
