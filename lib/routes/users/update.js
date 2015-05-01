var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("users").update({_id:new mongo.ObjectID(req.params.id)},{$set:{firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email,permissions:req.body.permissions}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
