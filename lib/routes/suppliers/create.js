module.exports = function(req,res){
    req.app.db.collection("contacts").update({_id:parseFloat(req.body.contact)},{$addToSet:{roles:"supplier"}},function(err){
        if(err) return res.fail();
        res.end();
    });
}
