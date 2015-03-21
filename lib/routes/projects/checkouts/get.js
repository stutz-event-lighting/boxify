var mongo = require("mongodb");
var async = require("async");
var util = require("../../../util.js");
var calcAvailable = require("../calculateavailable.js");


module.exports = function(req,res){
    var projectid = mongo.ObjectID(req.params.project);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmentcategories").find({},{name:true}).toArray(cb)
        },
        function(cb){
            req.app.db.collection("equipmenttypes").find({},{name:true,category:true}).toArray(cb);
        },
        function(cb){
            calcAvailable(req.app.db,projectid,cb)
        }
    ],function(err,results){
        if(err) return res.fail();
        var categories = util.createIndex(results[0],"_id");
        var types = util.createIndex(results[1],"_id");
        var available = results[2];

        console.log(available);

        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({
            categories:categories,
            types:types
        }));
    });
}
