var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this,{limit:"10mb"});

    var select = {_id:parseFloat(this.params.contact)};
    if(this.params.contact != this.session.user+""&&this.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(this.session.permissions.indexOf("users_write")>=0) roles.push("user");
        if(this.session.permissions.indexOf("customers_write")>=0) roles.push("customer");
        if(this.session.permissions.indexOf("suppliers_write")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };
    var contact = yield this.app.db.Contact.findOne(select);
    var parts = body.image.split(",");
    var mime = parts[0].substring(5,parts[0].length-7);
    var data = new Buffer(parts[1],"base64");
    var store = new mongo.GridStore(this.app.db.db,parseFloat(this.params.contact),"","w",{root:"contacts",content_type:mime});
    yield store.open();
    yield store.write(data,true);
    this.status = 200;
}
