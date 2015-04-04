var async = require("async");
module.exports = function(req,res){
    var type = parseInt(req.params.type,10);
    req.app.db.collection("equipmenttypes").findAndModify(
        {_id:type},
        null,
        {$inc:{nextId:1,count:1}},
        {fields:{nextId:true}},
        function(err,type){
            if(err) return res.fail();
            async.parallel([
                function(cb){
                    req.app.db.collection("equipment").insert({id:type.nextId,type:type._id,status:"normal",serialnumber:"",comment:"",contents:{}},cb)
                },function(cb){
                    req.app.db.collection("equipmentlogs").insert({time:new Date().getTime(),type:type._id,id:type.nextId,event:"added"},cb);
                }
            ],function(err){
                if(err) return res.fail();
                res.end(type.nextId+"");
            })
        }
    )
}
