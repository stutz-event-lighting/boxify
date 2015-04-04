var mongo = require("mongodb");
var async = require("async");

module.exports = function(req,res){
    var type = parseFloat(req.params.type);
    console.log("getting type:",type);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmenttypes").findOne({_id:type},{count:true},cb)
        },
        function(cb){
            var query = {};
            query["contents."+type] = {$exists:true};
            req.app.db.collection("equipment").find(query,{contents:true}).toArray(cb);
        }
    ],function(err,results){
        if(err) return res.fail(err);
        var type = results[0];
        console.log(type);
        var items = results[1];
        for(var i = 0; i < items.length; i++){
            type.count -= items[i].contents[type._id+""].count;
        }
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(type.count+"");
    })
}
