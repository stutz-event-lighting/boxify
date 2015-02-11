module.exports = function(req,res){
    req.app.db.collection("users").insert({username:req.body.username,permissions:{users:false,equipment:false}},function(err,data){
        if(err) return res.fail();
        res.end(data[0]._id+"");
    })
}
