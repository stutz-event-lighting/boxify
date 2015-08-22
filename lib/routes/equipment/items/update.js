module.exports = function(req,res){
    var type = parseInt(req.params.type,10);
    var id = parseInt(req.params.id,10);

    var query = {};
    if(req.body.comment) query.comment = req.body.comment;
    if(req.body.serialnumber) query.serialnumber = req.body.serialnumber;
    if(req.body.contents) query.contents = req.body.contents;

    req.app.db.collection("equipment").update({type:type,id:id},{$set:query},function(err){
        if(err) return res.fail();
        res.end();
    });
}
