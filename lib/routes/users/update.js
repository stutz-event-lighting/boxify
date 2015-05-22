var mongo = require("mongodb");
module.exports = function(req,res){
    if(req.session.permissions.indexOf("users_write") < 0 && req.params.id != req.session.user+"") return res.fail();
    var query = {firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email};
    if(req.body.permissions) query.permissions = req.body.permissions;
    req.app.db.collection("users").update({_id:new mongo.ObjectID(req.params.id)},{$set:query},function(err){
        if(err) return res.fail();
        res.end();
    })
}
