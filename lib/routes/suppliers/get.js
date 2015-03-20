var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("contacts").findOne({_id:mongo.ObjectID(req.params.id)},{_id:true,name:true},function(err,supplier){
        if(err || !supplier) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(supplier));
    })
}