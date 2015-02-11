var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("users").findOne({_id:new mongo.ObjectID(req.params.id)},{username:true,permissions:true},function(err,user){
        if(err || !user) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(user));
    });
}
