var parse = require("co-body");

module.exports = function*(){

    var body = yield parse.json(this);

    var id = parseFloat(this.params.id);
    if(this.session.user != id && this.session.permissions.indexOf("users_write") < 0) this.throw(403);
    var pull = [];
    var add = [];
    for(var permission in body.permissions){
        if(this.session.permissions.indexOf(permission) >= 0) (body.permissions[permission]?add:pull).push(permission);
    }
    yield [
        function*(){
            if(!pull.length) return;
            yield this.app.db.Contact.update({_id:id},{$pullAll:{"permissions":pull}})
        }.bind(this),
        function*(){
            if(!add.length) return;
            yield this.app.db.Contact.update({_id:id},{$addToSet:{"permissions":{$each:add}}})
        }.bind(this)
    ]
    this.status = 200;
}
