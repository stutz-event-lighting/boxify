var mongo = require("mongodb");
var async = require("async");
var util = require("../util.js");
module.exports = function(req,res){
    async.parallel([
        function(cb){
            req.app.db.collection("equipmenttransactions").findOne({_id:mongo.ObjectID(req.params.reservation)},{items:true},cb);
        },
        function(cb){
            req.app.db.collection("equipmenttypes").find({},{_id:true,name:true,category:true}).toArray(cb);
        },
        function(cb){
            req.app.db.collection("equipmentcategories").find({},{_id:true,name:true}).toArray(cb);
        }
    ],function(err,results){
        if(err) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({
            reservation:results[0],
            types:util.createIndex(results[1],"_id"),
            categories:util.createIndex(results[2],"_id")
        }));
    });
}
