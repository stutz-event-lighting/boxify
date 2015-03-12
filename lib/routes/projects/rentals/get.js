var mongo = require("mongodb");
var async = require("async");
var Calculation = require("../../../stockcalculation.js");
var util = require("../../../util.js");
module.exports = function(req,res){
    async.parallel([
        function(cb){
            var calculation = new Calculation(req.app.db);
            var project = new mongo.ObjectID(req.params.project);
            calculation.load(project,{},function(err){
                if(err) return cb(err);
                calculation.calculateNeededItemsForRental(req.params.rental);
                cb(null,calculation.types)
            });
        },
        function(cb) {
            req.app.db.collection("equipmentcategories").find({},{name:true}).toArray(cb)
        },
        function(cb){
            req.app.db.collection("equipmentrentals").findOne({_id:mongo.ObjectID(req.params.rental)},{status:true},cb);
        }
    ],function(err,results){
        if(err) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({
            categories:util.createIndex(results[1],"_id"),
            types:results[0],
            rental:results[2]
        }));
    })
}
