var mongo = require("mongodb");
var async = require("async");

module.exports = function(req,res){
    req.app.db.collection("equipmentio").update({_id:mongo.ObjectID(req.params.io)},{$set:{
        items:req.body.items,
        history:req.body.history
    }},function(err){
        if(err) return res.fail();
        res.end();
    });
}