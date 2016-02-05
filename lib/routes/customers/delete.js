module.exports = function(req,res){
    var id = parseFloat(req.params.id);
    req.app.db.collection("projects").find({customer:id}).count(function(err,count){
        if(count) return res.fail(601,"Customer in use");
        req.app.db.collection("contacts").findAndModify({_id:id},[],{$set:{customer:false}},function(err,contact){
            if(err) return res.fail();
            if(contact.supplier) return res.end();
            req.app.db.collection("contacts").remove({_id:id},function(err){
                if(err) return res.fail();
                res.end();
            })
        });
    });
}
