module.exports = function(req,res){
    var type = parseInt(req.params.type,10);
    var id = parseInt(req.params.id,10);
    req.app.db.collection("equipment").update({type:type,id:id},{$set:{comment:req.body.comment,serialnumber:req.body.serialnumber,contents:req.body.contents}},function(err){
        if(err) return res.fail();
        res.end();
    });
}
