var mongo = require("mongodb");

module.exports = function(req,res){
    req.app.db.collection("contacts").update({_id:mongo.ObjectID(req.params.user),$or:[{ownedBy:req.session.user},{_id:req.session.user}]},{$unset:{
        user:true,
        ownedBy:true,
        password:true,
        pin:true,
        permissions:true
    }},function(err){
        if(err) return res.fail();
        res.end();
    });
}
