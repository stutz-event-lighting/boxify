var mongo = require("mongodb");
module.exports = function(req,res){
    if(req.session.permissions.indexOf("users_read") < 0 && req.params.id != req.session.user+"") return res.fail();
    req.app.db.collection("users").findOne({_id:new mongo.ObjectID(req.params.id)},{firstname:true,lastname:true,email:true,permissions:true},function(err,user){
        if(err || !user) return res.fail();
        var permissions = {};
        for(var permission in req.app.app.permissions){
            var name = req.app.app.permissions[permission];
            permissions[permission] = {name:name,allowed:user.permissions.indexOf(permission) >= 0};
        }
        user.permissions = permissions;

        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(user));
    });
}
