var async = require("async");
module.exports = function(req,res){
    var type = parseInt(req.params.type,10);
    var id = parseInt(req.params.id,10);
    async.parallel([
        function(cb){
            req.app.db.collection("equipment").findOne({type:type,id:id},{id:true,type:true,comment:true},cb);
        },
        function(cb){
            req.app.db.collection("equipmentlogs").find({type:type,id:id},{}).sort({time:-1}).toArray(cb);
        }
    ],function(err,data){
        if(err) return res.fail();
        var contentbyid = {};
        var types = [];
        for(var i = 0; i < data[0].content.length; i++){
            types.push(data[i].type);
            contentbyid[data[i].type] = data[i];
        }
        req.app.db.collection("equipmenttypes").find({_id:{$in:types}},{name:true}).toArray(function(err,types){
            if(err) return res.fail();
            for(var i = 0; i < types.length; i++){
                contentbyid[types[i]._id].name = types[i].name;
            }
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify({item:data[0],logs:data[1]}));
        });
    });
}
