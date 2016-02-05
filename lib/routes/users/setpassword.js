var mongo = require("mongodb");

module.exports = function(req,res){
    req.app.db.collection("contacts").update({_id:parseFloat(req.params.user),$or:[{ownedBy:req.session.user},{_id:req.session.user}]},{$set:{password:req.body.password}},function(err){
        if(err) return res.fail();
        res.end();
    })
}
