module.exports = function(req,res){
    req.app.db.collection("sessions").remove({_id:req.params.session},function(err){
        if(err) return res.fail();
        res.end();
    })
}
