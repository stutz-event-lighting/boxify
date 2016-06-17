module.exports = function(req,res){
    var id = parseFloat(req.params.id);
    req.app.db.collection("equipmentrentals").find({supplier:id}).count(function(err,count){
        if(count) return res.fail(601,"Supplier in use");
        req.app.db.collection("contacts").update({_id:id},[],{$pull:{roles:"supplier"}},function(err){
            if(err) return res.fail();
            res.end();
        });
    });
}
