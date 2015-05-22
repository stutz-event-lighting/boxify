var mongo = require("mongodb");

module.exports = function(req,res){
    if(req.session.permissions.indexOf("users_write") < 0 && req.params.user != req.session.user+"") return res.fail();
    req.app.db.collection("users").update({_id:mongo.ObjectID(req.params.user)},{$set:{pin:req.body.pin}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
