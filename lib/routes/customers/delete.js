module.exports = function(req,res){
    var id = parseFloat(req.params.id);
    req.app.db.collection("projects").find({customer:id}).count(function(err,count){
        if(count) return res.fail(601,"Customer in use");
        req.app.db.collection("contacts").update({_id:id},[],{$pull:{roles:"customer"}},function(err){
            if(err) return res.fail();
            res.end();
        });
    });
}
