var mongo = require("mongodb");
var async = require("async");

var calcBalance = require("../projects/calculatebalance.js");
var calcReservations = require("../projects/calculatereserved.js");

module.exports = function(req,res){
    req.app.db.collection("equipmentio").findOne({_id:mongo.ObjectID(req.params.io)},{project:true,items:true,reservation:true,history:true},function(err,io){
        if(err) return res.fail();
        if(io.reservation){
            req.app.db.collection("equipmentreservations").findOne({_id:io.reservation},{items:true},function(err,reservation){
                if(err) return res.fail();
                for(var type in reservation.items){
                    if(io.items[type]) reservation.items[type] -= (io.items[type].count||0);
                    if(reservation.items[type] <= 0) delete reservation.items[type];
                }
                if(Object.keys(reservation.items).length){
                    req.app.db.collection("equipmentreservations").update({_id:io.reservation},{$set:{items:reservation.items}},finish);
                }else{
                    req.app.db.collection("equipmentreservations").remove({_id:io.reservation},finish);
                }
            })
        }else{
            finish();
        }
        function finish(err){
            async.eachSeries(io.history,function(entry,cb){
                var query = {};

                if(entry.source){
                    query.id = entry.source.item;
                    query.type = entry.source.type;
                }else{
                    var id = Object.keys(entry.items)[0];
                    query["contents."+entry.type+".ids"] = id;
                }

                req.app.db.collection("equipment").findOne(query,{contents:true},function(err,item){
                    if(err) return cb(err);
                    if(item.contents[entry.type].count - entry.count > 0){
                        var op = {$inc:{}};
                        op.$inc["contents."+entry.type+".count"] = -entry.count;
                        if(id){
                            op.$pull = {};
                            op.$pull["contents."+entry.type+".ids"] = id;
                        }
                    }else{
                        var op = {$unset:{}}
                        op.$unset["contents."+entry.type] = true;
                    }
                    req.app.db.collection("equipment").update(query,op,cb);
                });
            },function(err){
                if(err) return res.fail();
                req.app.db.collection("equipmentio").update({_id:io._id},{$set:{user:req.session.user,time:new Date().getTime()},$unset:{draft:true,reservation:true}},function(err){
                    if(err) return res.fail();
                    async.parallel([
                        function(cb){
                            calcBalance(req.app.db,io.project,cb);
                        },
                        function(cb){
                            calcReservations(req.app.db,io.project,cb)
                        }
                    ],function(err){
                        if(err) return res.fail();
                        res.end();
                    })
                })
            })
        }
    })
}
