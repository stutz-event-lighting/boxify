var mongo = require("mongodb");
var async = require("async");
module.exports = function(req,res){
    if(req.session.permissions.indexOf("users_read") < 0 && req.params.id != req.session.user+"") return res.fail();
    var id = new mongo.ObjectID(req.params.id);
    async.parallel([
        function(cb){
            req.app.db.collection("contacts").findOne({_id:id},{permissions:true,ownedBy:true},cb);
        },
        function(cb){
            req.app.db.collection("contacts").find({ownedBy:id},{firstname:true,lastname:true}).toArray(cb)
        }
    ],function(err,results){
        if(err) return res.fail();

        var user = results[0];
        if(!user) return res.fail();

        var permissions = {};
        for(var permission in req.app.app.permissions){
            var name = req.app.app.permissions[permission];
            permissions[permission] = {name:name,allowed:user.permissions.indexOf(permission) >= 0};
        }
        user.permissions = permissions;
        user.ownedUsers = results[1].map(function(user){return {_id:user._id,name:user.firstname+" "+user.lastname}});

        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(user));
    });
}
