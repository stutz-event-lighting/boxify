var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("equipmenttypes").find({category:mongo.ObjectID(req.params.id)}).count(function(err,count){
        if(count) return res.fail(601,"Category in use");
        req.app.db.collection("equipmentcategories").remove({_id:mongo.ObjectID(req.params.id)},function(err){
            if(err) return res.fail();
            res.end();
        })
    })
}
