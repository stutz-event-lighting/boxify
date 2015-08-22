module.exports = function(req,res){
    req.app.db.collection("equipmenttags").update({_id:req.params.tag},{$set:{_id:req.body.tag}},function(err){
        if(err) return res.fail();
        res.end();
    });
}
