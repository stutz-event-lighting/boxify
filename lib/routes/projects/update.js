var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("projects").update({_id:mongo.ObjectID(req.params.id)},{$set:{name:req.body.name,comment:req.body.comment}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
