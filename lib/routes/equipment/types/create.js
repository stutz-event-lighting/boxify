module.exports = function(req,res){
    req.app.db.collection("idcounters").findAndModify(
        {collection:"equipmenttypes"},
        null,
        {$inc:{nextId:1}},
        {fields:{nextId:true}}
    ,function(err,item){
        if(err) return res.fail();
        req.app.db.collection("equipmenttypes").insert({_id:item.nextId,name:req.body.name,technicalDescription:"",count:0,accessories:[],nextId:1},function(err){
            if(err) return res.fail();
            res.end(item.nextId+"");
        });
    });
}
