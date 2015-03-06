var mongo = require("mongodb");
var async = require("async");

module.exports = function(req,res){
    var id = mongo.ObjectID(req.params.id);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmentreservations").remove({project:id},cb);
        },
        function(cb){
            req.app.db.collection("equipmentrentals").remove({project:id},cb);
        },
        function(cb){
            req.app.db.collection("equipmentcheckouts").remove({project:id},cb);
        },
        function(cb){
            req.app.db.collection("equipmentcheckins").remove({project:id},cb);
        },
        function(cb){
            req.app.db.collection("projects").remove({_id:id},cb);
        }
    ],function(err){
        if(err) return res.fail();
        res.end();
    });    
}
