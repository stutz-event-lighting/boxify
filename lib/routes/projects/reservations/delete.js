var mongo = require("mongodb");
var calcReserved = require("../calculatereserved.js");
module.exports = function(req,res){
    req.app.db.collection("equipmentreservations").remove({_id:mongo.ObjectID(req.params.reservation)},function(err){
        if(err) return res.fail();
        calcReserved(req.app.db,mongo.ObjectID(req.params.project),function(err){
            if(err) return res.fail();
            res.end();
        })
    })
}
