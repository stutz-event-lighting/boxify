var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("contacts").update({_id:mongo.ObjectID(req.body.contact)},{$addToSet:{roles:"supplier"}},function(err){
        if(err) return res.fail();
        res.end();
    });
}
