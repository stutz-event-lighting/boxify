var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("contacts").update({_id:mongo.ObjectID(req.body.contact)},{$addToSet:{roles:"customer"}},function(err){
        if(err) return res.fail();
        res.end();
    });
}
