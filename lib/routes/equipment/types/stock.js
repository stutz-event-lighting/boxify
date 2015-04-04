var mongo = require("mongodb");
var async = require("async");

module.exports = function(req,res){
    async.parallel([
        function(cb){
            db.collection("equipmenttypes").findOne({_id:type},{count:true},cb)
        },
        function(cb){
            var query = {};
            query["contents."+type] = {$exists:true};
            db.collection("equipment").find(query,{contents:true}).toArray(cb);
        }
    ],function(err,results){
        if(err) return res.fail(err);
        var type = results[0];
        var items = results[1];
        for(var i = 0; i < items.length; i++){
            type.count -= items[i].contents[type+""].count;
        }
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(type.count+"");
    })
}
