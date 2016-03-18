var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("projects").update({_id:mongo.ObjectID(req.params.id)},{$set:{name:req.body.name,start:req.body.start,end:req.body.end,remark:req.body.remark}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
