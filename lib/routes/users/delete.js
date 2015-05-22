var mongo = require("mongodb");

module.exports = function(req,res){
    if(req.session.permissions.indexOf("users_write") < 0 && req.params.user != req.session.user+"") return res.fail();
    req.app.db.collection("users").remove({_id:mongo.ObjectID(req.params.user)},function(err){
        if(err) return res.fail();
        res.end();
    })
}
