var mongo = require("mongodb");
module.exports = function(req,res){
    req.app.db.collection("projects").findOne({_id:mongo.ObjectID(req.params.id)},{_id:true,name:true,customer:true},function(err,project){
        if(err || !project) return res.fail();
        req.app.db.collection("customers").findOne({_id:project.customer},{name:true},function(err,customer){
            if(err || !customer) return res.fail();
            project.customername = customer.name;
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify({project:project}));
        })
    })
}
