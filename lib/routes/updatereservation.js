var mongo = require("mongodb");

module.exports = function(req,res){
    req.app.db.collection("equipmentreservations").update({_id:mongo.ObjectID(req.params.reservation)},{$set:{items:req.body}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
