var mongo = require("mongodb");
var calcBalance = require("../calculatebalance.js");

module.exports = function(req,res){
    console.log("removing");
    req.app.db.collection("equipmentio").remove({_id:mongo.ObjectID(req.params.checkout)},function(err){
        if(err) return res.fail();
        calcBalance(req.app.db,mongo.ObjectID(req.params.project),function(err){
            if(err) return res.fail();
            res.end();
        })
    })
}
