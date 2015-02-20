var mongo = require("mongodb");

module.exports = function(req,res){
    res.app.db.collection("projects").remove({_id:mongo.ObjectID(req.params.id)},function(err){
        if(err) return res.fail();
        res.end();
    })
}
