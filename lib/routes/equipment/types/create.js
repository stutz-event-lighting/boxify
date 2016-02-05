module.exports = function(req,res){
    req.app.db.collection("settings").findAndModify(
        {_id:"nextEquipmenttypeID"},
        null,
        {$inc:{value:1}},
        {fields:{value:true}},
    function(err,item){
        if(err) return res.fail();
        req.app.db.collection("equipmenttypes").insert({_id:item.value,name:req.body.name,technicalDescription:"",count:0,accessories:[],nextId:1},function(err){
            if(err) return res.fail();
            res.end(item.value+"");
        });
    });
}
