var mongo = require("mongodb");

module.exports = function(req,res){
    req.app.db.collection("equipmentrentals").update({_id:mongo.ObjectID(req.params.rental)},{$set:{status:req.body.status}},function(err){
        if(err) return res.fail();
        res.end();
    });
}
