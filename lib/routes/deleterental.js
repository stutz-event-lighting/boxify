var mongo = require("mongodb");

module.exports = function(req,res){
    req.app.db.collection("equipmentrentals").remove({_id:mongo.ObjectID(req.params.rental)},function(err){
        if(err) return res.fail();
        res.end();
    })
}
