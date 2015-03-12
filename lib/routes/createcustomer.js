module.exports = function(req,res){
    req.app.db.collection("contacts").findAndModify({name:req.body.name},[],{$set:{name:req.body.name,customer:true}},{upsert:true,new:true},function(err,contact){
        if(err) return res.fail();
        res.end(contact._id+"");
    });
}
