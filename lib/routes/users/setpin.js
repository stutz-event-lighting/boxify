var mongo = require("mongodb");

module.exports = function(req,res){
    req.app.db.collection("users").update({_id:mongo.ObjectID(req.params.user)},{$set:{pin:req.body.pin}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
