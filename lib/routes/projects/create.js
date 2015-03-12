var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("projects").insert({customer:mongo.ObjectID(req.body.customer),name:req.body.name,start:req.body.start,end:req.body.end,balance:{},needs:{}},function(err,created){
        if(err) return res.fail();
        res.end(created[0]._id+"");
    });
}
