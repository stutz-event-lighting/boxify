var mongo = require("mongodb");
var async = require("async");
var calcProjBalance = require("../../../calculateprojectbalance.js");
var calcProjRentals = require("../../../calculateprojectrentals.js");

module.exports = function(req,res){
    req.app.db.collection("equipmentrentals").update({_id:mongo.ObjectID(req.params.rental)},{$set:{status:req.body.status,items:req.body.items}},function(err){
        if(err) return res.fail();
        async.parallel([
            function(cb){
                calcProjBalance(req.app.db,mongo.ObjectID(req.params.project),cb)
            },
            function(cb){
                calcProjRentals(req.app.db,mongo.ObjectID(req.params.project),cb)
            }
        ],function(err){
            if(err) return res.fail();
            res.end();
        });
    });
}
