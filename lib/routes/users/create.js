module.exports = function(req,res){
    req.app.db.collection("contacts").update({_id:parseFloat(req.body.contact)},{$set:{ownedBy:[req.session.user],permissions:[]},$addToSet:{roles:"user"}},function(err){
        if(err) return res.fail();
        res.end();
    });
}
