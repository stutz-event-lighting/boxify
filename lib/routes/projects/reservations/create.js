var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("equipmentreservations").insert({
        project:mongo.ObjectID(req.params.project),
        items:{}
    },function(err,docs){
        if(err) return res.fail();
        res.end(docs.ops[0]._id+"");
    });
}
