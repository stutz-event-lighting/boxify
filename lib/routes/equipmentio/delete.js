var mongo = require("mongodb");

module.exports = function(req,res){
    req.app.db.collection("equipmentio").remove({_id:mongo.ObjectID(req.params.io)},function(err){
        if(err) return res.fail();
        res.end();
    })
}
