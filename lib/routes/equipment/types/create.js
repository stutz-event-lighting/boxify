module.exports = function(req,res){
    req.app.db.collection("settings").findAndModify(
        {_id:"main"},
        null,
        {$inc:{nextEquipmenttypeId:1}},
        {fields:{nextEquipmenttypeId:true}},
    function(err,item){
        if(err) return res.fail();
        req.app.db.collection("equipmenttypes").insert({_id:item.nextEquipmenttypeId,name:req.body.name,technicalDescription:"",count:0,accessories:[],nextId:1},function(err){
            if(err) return res.fail();
            res.end(item.value+"");
        });
    });
}
