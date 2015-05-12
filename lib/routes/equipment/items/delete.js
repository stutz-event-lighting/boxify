var async = require("async");
module.exports = function(req,res){
    var type = parseInt(req.params.type,10);
    var id = parseInt(req.params.id,10);
    async.parallel([
        function(cb){
            req.app.db.collection("equipment").remove({type:type,id:id},cb)
        },
        function(cb){
            req.app.db.collection("equipmenttypes").update({_id:type},{$inc:{count:-1}},function(err){
                if(err) return cb(err);
                req.app.db.collection("equipmenttypes").update({_id:type,count:0},{$unset:{hasItems:true}},cb);
            });
        },
        function(cb){
            req.app.db.collection("equipmentlogs").insert({time:new Date().getTime(),type:type,id:id,event:"removed"},cb)
        }
    ],function(err){
        if(err) return res.fail();
        res.end();
    })
}
