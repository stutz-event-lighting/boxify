var mongo = require("mongodb");
var async = require("async");
var util = require("../util.js");
var Calculation = require("../stockcalculation");

module.exports = function(req,res){
    var projectid = mongo.ObjectID(req.params.project);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmentcategories").find({},{name:true}).toArray(cb)
        },
        function(cb){
            var calculation = new Calculation(req.app.db);
            calculation.load(mongo.ObjectID(req.params.project),{category:true},function(err){
                if(err) return cb(err);
                calculation.calculateAvailableItemsForCheckout(req.params.checkout,req.params.reservation);
                cb(null,calculation.types);
            });
        }

    ],function(err,results){
        if(err) return res.fail();
        var categories = util.createIndex(results[0],"_id");
        var types = results[1];
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({
            categories:categories,
            types:types
        }));
    });
}
