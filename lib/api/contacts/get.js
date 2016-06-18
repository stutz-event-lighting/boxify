var util = require("../../util.js");
var parse = require("co-body");
module.exports = function*(){
    var select = {_id:parseFloat(this.params.contact)};
    if(this.params.contact != this.session.user+"" && this.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(this.session.permissions.indexOf("users_read")>=0) roles.push("user");
        if(this.session.permissions.indexOf("customers_read")>=0) roles.push("customer");
        if(this.session.permissions.indexOf("suppliers_read")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };
    var contact = yield this.app.db.Contact
        .findOne(select)
        .select("type salutation firstname lastname streetName streetNr zip city emails phones contacts")
        .populate("contacts._id",undefined,undefined,{select:"firstname lastname"});
    if(!contact) this.throw(404);

    contact = JSON.parse(JSON.stringify(contact));
    for(var c of contact.contacts){
        c.name = c._id.firstname+(c._id.lastname?(" "+c._id.lastname):"");
        c.id = c._id._id;
        delete c._id;
    }

    this.set("Content-Type","application/json");
    this.body = JSON.stringify(contact);
}
