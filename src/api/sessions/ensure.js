var get = require("./get");

module.exports = async function(db,id,permission){
    var session = await get(db,id);
    if(!session) throw new Error("permission denied");
    if(session.permissions.indexOf(permission) < 0) throw new Error("Insufficient Permissions");
    return session;
}
