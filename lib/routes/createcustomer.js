module.exports = function(req,res){
    req.app.db.collection("customers").insert({name:req.body.name},function(err,created){
        if(err) return res.fail();
        res.end(created[0]._id+"");
    });
}
