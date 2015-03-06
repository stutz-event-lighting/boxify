var mongo = require("mongodb");

module.exports = function(req,res){
    var id = mongo.ObjectID(req.params.id);
    req.app.db.collection("equipmentrentals").find({supplier:id}).count(function(err,count){
        if(count) return res.fail(601,"Supplier in use");
        req.app.db.collection("suppliers").remove({_id:id},function(err){
            if(err) return res.fail();
            res.end();
        });
    });
}
