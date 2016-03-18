var async = require("async");
module.exports = function(req,res){
    var id = parseFloat(req.params.id);
    if(req.session.permissions.indexOf("users_read") < 0 && id != req.session.user) return res.fail();

    req.app.db.collection("contacts").findOne({_id:id},{permissions:true},function(err,user){
        if(err) return res.fail();

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
