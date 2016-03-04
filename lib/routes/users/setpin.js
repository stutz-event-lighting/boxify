module.exports = function(req,res){
    var id = parseFloat(req.params.user);
    if(req.session.user != id && req.session.permissions.indexOf("users_write") < 0) return res.fail(600);
    req.app.db.collection("contacts").update({_id:id},{$set:{pin:req.body.pin}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
