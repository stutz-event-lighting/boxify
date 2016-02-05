var mongo = require("mongodb");
var async = require("async");

module.exports = function(req,res){
    var query = {};
    if(req.body.search){
        query.name = {$regex:"^"+req.body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"};
    }
    req.app.db.collection("equipmentrentals").find(query,{_id:true,supplier:true,name:true,projects:true,delivery:true,return:true,items:true,status:true}).toArray(function(err,rentals){
        if(err) return res.fail(err);

        var bysupplier = {};
        var byproject = {};
        for(var i = 0; i < rentals.length; i++){
            bysupplier[rentals[i].supplier+""] = true;
            for(var j = 0; j < rentals[i].projects.length; j++) byproject[rentals[i].projects[j]+""] = true;
        }
        var supplierids = Object.keys(bysupplier).map(function(id){return parseFloat(id)});
        var projectids = Object.keys(byproject).map(function(id){return mongo.ObjectID(id)});


        async.parallel([
            function(cb){
                req.app.db.collection("contacts").find({_id:{$in:supplierids}},{firstname:true,lastname:true}).toArray(cb);
            },
            function(cb){
                req.app.db.collection("projects").find({_id:{$in:projectids}},{name:true}).toArray(cb);
            }
        ],function(err,results){
            if(err) return res.fail();
            var suppliers = results[0];
            for(var i = 0; i < suppliers.length; i++){
                var s = suppliers[i];
                bysupplier[s._id+""] = (s.firstname?s.firstname+" ":"")+(s.lastname||"");
            }
            var projects = results[1];
            for(var i = 0; i < projects.length; i++){
                var p = projects[i];
                byproject[p._id+""] = p.name;
            }
            for(var i = 0; i < rentals.length; i++){
                rentals[i].supplier = bysupplier[rentals[i].supplier+""];
                for(var j = 0; j < rentals[i].projects.length; j++){
                    rentals[i].projects[j] = byproject[rentals[i].projects[j]+""];
                }
            }
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify(rentals));
        })
    });
}
