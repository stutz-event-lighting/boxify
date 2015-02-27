var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("equipmenttransactions").remove({_id:mongo.ObjectID(req.params.reservation)},function(err){
        if(err) return res.fail();
        res.end();
    })
}
