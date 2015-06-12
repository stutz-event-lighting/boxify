var async = require("async");
module.exports = function(req,res){
    var id = parseInt(req.params.type);

    var query = {};
    switch(req.body.type){
        case "add":
            query.$inc = {count:req.body.count};
            break;
        case "remove":
            query.$inc = {count:-req.body.count};
            break;
        default:
            return res.fail(601,"Invalid type");
    }

    async.parallel([
        function(cb){
            req.app.db.collection("equipmenttypes").update({_id:id},query,cb)
        },
        function(cb){
            req.app.db.collection("equipmentlogs").insert({time:new Date().getTime(),type:id,count:req.body.count,event:req.body.type=="add"?"added":"removed"},cb);
        }
    ],function(err){
        if(err) return res.fail();
        res.end();
    });
}
