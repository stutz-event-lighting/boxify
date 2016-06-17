module.exports = function(req,res){
    req.app.db.collection("equipmentcategories").insert({name:req.body.name},function(err,info){
        if(err) return res.fail();
        res.end(info.ops[0]._id+"");
    })
}
