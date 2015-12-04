var mongo = require("mongodb");
var async = require("async");
var util = require("../../util.js");
var calcBalance = require("../equipment/calculatebalance.js");

module.exports = function(req,res){
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
            req.app.db.collection("equipmentio").findOne({_id:mongo.ObjectID(req.params.io)},{person:true,project:true,items:true,history:true,draft:true,reservation:true},cb)
        }
    ],function(err,results){
        if(err) return res.fail();
        var categories = util.createIndex(results[0],"_id");
        var types = util.createIndex(results[1],"_id");
        var balance = results[2];
        var checkout = results[3];
        var items = checkout.items;
        var history = checkout.history;

        async.parallel([
            function(cb){
                req.app.db.collection("projects").findOne({_id:checkout.project},{balance:true},cb)
            },
            function(cb){
                if(!checkout.reservation) return cb();
                req.app.db.collection("equipmentreservations").findOne({_id:checkout.reservation},{items:true},cb)
            }
        ],function(err,results){
            if(err) return res.fail();
            var project = results[0];
            var reservation = results[1];

            for(var type in types){
                if(balance[type]){
                    types[type].available = balance[type].count;
                    types[type].suppliers = {};
                    for(var supplier in balance[type].suppliers){
                        types[type].suppliers[supplier] = {available:balance[type].suppliers[supplier]}
                    }
                }
                if(items && items[type]){
                    types[type].count = items[type].count;
                    types[type].available = (types[type].available||0)+cap(types[type].count,project.balance[type]?project.balance[type].count:0);
                    if(!types[type].suppliers) types[type].suppliers = {};
                    for(var supplier in items[type].suppliers){
                        if(!types[type].suppliers[supplier]) types[type].suppliers[supplier] = {available:0}
                        types[type].suppliers[supplier].count = items[type].suppliers[supplier].count;
                        types[type].suppliers[supplier].available += cap(items[type].suppliers[supplier].count,(project.balance[type]&&project.balance[type].suppliers[supplier])?-project.balance[type].suppliers[supplier]:0);
                        types[type].suppliers[supplier].ids = items[type].suppliers[supplier].ids;
                    }
                }
                if(reservation && reservation.items[type]){
                    types[type].needed = reservation.items[type];
                }
            }

            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify({
                person:checkout.person,
                draft:checkout.draft,
                categories:categories,
                types:types,
                history:history
            }));
        });
    });
}

function cap(x,y){
    return x;
    if(x < y) return x;
    return y;
}
