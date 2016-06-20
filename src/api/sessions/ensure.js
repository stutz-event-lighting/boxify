var get = require("./get");

module.exports = function*(db,id,permission){
    var session = yield get(db,id);
    if(!session) this.throw(403);
    if(session.permissions.indexOf(permission) < 0) throw new Error("Insufficient Permissions");
    return session;
}
