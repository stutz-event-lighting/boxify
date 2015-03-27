var mongo = require("mongodb");
var async = require("async");
var calcBalance = require("../calculatebalance.js");
var calcReservations = require("../calculatereserved.js");

module.exports = function(req,res){
    if(req.params.checkout == "new"){
        req.params.checkout = mongo.ObjectID()+"";
    }
    async.parallel([
        function(cb){
            req.app.db.collection("equipmentio").update({_id:mongo.ObjectID(req.params.checkout)},{$set:{
                project:mongo.ObjectID(req.params.project),
                type:"checkout",
                time:new Date().getTime(),
                items:req.body
            }},{upsert:true},cb)
        },
        function(cb){
            if(!req.query.reservation) return cb();
            req.app.db.collection("equipmentreservations").findOne({_id:mongo.ObjectID(req.query.reservation)},{items:true},function(err,reservation){
                if(err) return cb(err);
                for(var type in reservation.items){
                    reservation.items[type] -= (req.body[type].count||0);
                    if(reservation.items[type] <= 0) delete reservation.items[type];
                }
                if(Object.keys(reservation.items).length){
                    req.app.db.collection("equipmentreservations").update({_id:mongo.ObjectID(req.query.reservation)},{$set:{items:reservation.items}},cb);
                }else{
                    req.app.db.collection("equipmentreservations").remove({_id:mongo.ObjectID(req.query.reservation)},cb);
                }
            })
        }
    ],function(err){
        if(err) return res.fail();
        async.parallel([
            function(cb){
                calcBalance(req.app.db,mongo.ObjectID(req.params.project),cb);
            },
            function(cb){
                calcReservations(req.app.db,mongo.ObjectID(req.params.project),cb)
            }
        ],function(err){
            if(err) return res.fail();
            res.end();
        })
    })

}
