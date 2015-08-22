var get = require("./get.js");

module.exports = function(boxify,id,permission,cb){
    get(boxify,id,function(err,session){
        if(err) return cb(err);
        if(session.permissions.indexOf(permission) < 0) return cb(new Error("Insufficient Permissions"));
        cb(null,session);
    })
}
