module.exports = function(req,res){
    req.app.db.collection("equipmenttypes").findOne({_id:parseFloat(req.params.type)},{name:true},function(err,type){
        if(err) return res.fail();
        res.end(type.name);
    })
}
