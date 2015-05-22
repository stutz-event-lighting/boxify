var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("projects").update({_id:mongo.ObjectID(req.params.id)},{$set:{status:"finished"}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
