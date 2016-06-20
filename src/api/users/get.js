var async = require("async");
module.exports = function*(){
    var id = parseFloat(this.params.id);
    if(this.session.permissions.indexOf("users_read") < 0 && id != this.session.user) this.throw(403);

    var user = yield this.app.db.Contact.findOne({_id:id}).select("permissions");
    if(!user) this.throw(404);
    user = JSON.parse(JSON.stringify(user));
    var permissions = {};
    for(var permission in this.app.permissions){
        var name = this.app.permissions[permission];
        permissions[permission] = {name:name,allowed:user.permissions.indexOf(permission) >= 0};
    }
    user.permissions = permissions;
    this.set("Content-Type","application/json");
    this.body = JSON.stringify(user);
}
