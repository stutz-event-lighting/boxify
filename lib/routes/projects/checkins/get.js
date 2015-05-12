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
            req.app.db.collection("equipmenttypes").find({},{name:true,category:true,hasItems:true}).toArray(cb);
        },
        function(cb){
            req.app.db.collection("projects").findOne({_id:projectid},{balance:true},cb)
        },
        function(cb){
            if(req.params.checkin == "new") return cb();
            req.app.db.collection("equipmentio").findOne({_id:mongo.ObjectID(req.params.checkin)},{items:true},cb)
        }
    ],function(err,results){
        if(err) return res.fail();
        var categories = util.createIndex(results[0],"_id");
        var types = util.createIndex(results[1],"_id");
        var balance = results[2].balance;
        var checkin = results[3];
        var items;

        if(checkin){
            items = checkin.items;
        }

        for(var type in types){
            if(balance[type]){
                types[type].available = -balance[type].count;
                types[type].suppliers = {};
                for(var supplier in balance[type].suppliers){
                    types[type].suppliers[supplier] = {available:-balance[type].suppliers[supplier]}
                }
            }
            if(items && items[type]){
                types[type].count = items[type].count;
                types[type].available = (types[type].available||0)+types[type].count;
                if(!types[type].suppliers) types[type].suppliers = {};
                for(var supplier in items[type].suppliers){
                    if(!types[type].suppliers[supplier]) types[type].suppliers[supplier] = {available:0};
                    types[type].suppliers[supplier].count = items[type].suppliers[supplier].count;
                    types[type].suppliers[supplier].available += items[type].suppliers[supplier].count;
                    types[type].suppliers[supplier].ids = items[type].suppliers[supplier].ids;
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
