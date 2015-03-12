var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("users").update({_id:new mongo.ObjectID(req.params.id)},{$set:{username:req.body.username,permissions:req.body.permissions}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
