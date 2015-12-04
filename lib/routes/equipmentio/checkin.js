var mongo = require("mongodb");
var async = require("async");
var util = require("../../util.js");

module.exports = function(req,res){
    async.parallel([
        function(cb){
            req.app.db.collection("equipmenttypes").find({},{name:true,hasItems:true,contents:true}).toArray(cb);
        },
        function(cb){
            req.app.db.collection("equipmentio").findOne({_id:mongo.ObjectID(req.params.io)},{project:true,items:true,history:true,draft:true},cb)
        }
    ],function(err,results){
        if(err) return res.fail();
        var types = util.createIndex(results[0],"_id");
        var checkin = results[1];
        var items = checkin.items;
        var history = checkin.history;

        req.app.db.collection("projects").findOne({_id:checkin.project},{balance:true},function(err,project){
            if(err) return res.fail();
            var balance = project.balance;

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
                draft:checkin.draft,
                types:types,
                history:history
            }));
        });
    });
}
