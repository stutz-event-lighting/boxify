var mongo = require("mongodb");

module.exports = function(req,res){
    req.app.db.collection("users").remove({_id:mongo.ObjectID(req.params.user)},function(err){
        if(err) return res.fail();
        res.end();
    })
}
