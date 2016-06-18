var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    var id = parseFloat(this.params.user);
    if(this.session.user != id && this.session.permissions.indexOf("users_write") < 0) this.throw(403);
    yield this.app.db.Contact.update({_id:id},{$set:{password:body.password}});
    this.status = 200;
}
