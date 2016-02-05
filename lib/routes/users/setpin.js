module.exports = function(req,res){
    req.app.db.collection("contacts").update({_id:parseFloat(req.params.user),$or:[{ownedBy:req.session.user},{_id:req.session.user}]},{$set:{pin:req.body.pin}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
