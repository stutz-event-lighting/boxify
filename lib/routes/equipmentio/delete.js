var mongo = require("mongodb");
var async = require("async");
var calculateBalance = require("../projects/calculatebalance.js");

module.exports = function(req,res){
    var id = mongo.ObjectID(req.params.io);
    req.app.db.collection("equipmentio").findOne({_id:id},{project:true},function(err,io){
        async.parallel([
            function(cb){
                req.app.db.collection("equipmentio").remove({_id:id},cb);
            },
            function(cb){
                calculateBalance(req.app.db,io.project,cb)
            }
        ],function(err){
            if(err) return res.fail();
            res.end();
        });
    })

}
