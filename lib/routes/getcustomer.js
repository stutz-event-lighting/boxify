var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("customers").findOne({_id:mongo.ObjectID(req.params.id)},{_id:true,name:true},function(err,customer){
        if(err || !customer) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(customer));
    })
}
