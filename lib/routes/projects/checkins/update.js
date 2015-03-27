var mongo = require("mongodb");
var async = require("async");
var calcBalance = require("../calculatebalance.js");
var calcReservations = require("../calculatereserved.js");

module.exports = function(req,res){
    if(req.params.checkin == "new"){
        req.params.checkin = mongo.ObjectID()+"";
    }
    req.app.db.collection("equipmentio").update({_id:mongo.ObjectID(req.params.checkin)},{$set:{
        project:mongo.ObjectID(req.params.project),
        type:"checkin",
        time:new Date().getTime(),
        items:req.body
    }},{upsert:true},function(err){
        if(err) return res.fail();
        calcBalance(req.app.db,mongo.ObjectID(req.params.project),function(err){
            if(err) return res.fail();
            res.end();
        })
    });
}
