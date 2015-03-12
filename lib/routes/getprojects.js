var mongo = require("mongodb");
module.exports = function(req,res){
    var query = {};
    if(req.body.search){
        query.name = {$regex:"^"+req.body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"};
    }
    req.app.db.collection("projects").find(query,{_id:true,name:true,customer:true}).toArray(function(err,projects){
        if(err) return res.fail(err);

        var bycustomer = {};
        for(var i = 0; i < projects.length; i++){
            var p = projects[i];
            var arr = bycustomer[p.customer+""];
            if(!arr) arr = bycustomer[p.customer+""] = [];
            arr.push(p);
        }

        var customerids = Object.keys(bycustomer).map(function(id){return mongo.ObjectID(id)});

        req.app.db.collection("contacts").find({_id:{$in:customerids}},{name:true}).toArray(function(err,customers){
            if(err) return res.fail();
            for(var i = 0; i < customers.length; i++){
                var c = customers[i];
                var projectsofcustomer = bycustomer[c._id+""];
                for(var j = 0; j < projectsofcustomer.length; j++){
                    projectsofcustomer[j].customer = c.name;
                }
            }
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify(projects));
        });
    });
}
