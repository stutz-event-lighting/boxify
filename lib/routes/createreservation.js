var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("equipmenttransactions").insert({
        project:mongo.ObjectID(req.params.project),
        type:"reservation",
        items:[]
    },function(err,docs){
        if(err) return res.fail();
        res.end(docs[0]._id+"");
    });
}
