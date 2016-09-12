var util = require("../../util");
var parse = require("co-body");
module.exports = async function(ctx){
    var select = {_id:parseFloat(ctx.params.contact)};
    if(ctx.params.contact != ctx.session.user+"" && ctx.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(ctx.session.permissions.indexOf("users_read")>=0) roles.push("user");
        if(ctx.session.permissions.indexOf("customers_read")>=0) roles.push("customer");
        if(ctx.session.permissions.indexOf("suppliers_read")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };
    var contact = await ctx.app.db.Contact
        .findOne(select)
        .select("type salutation firstname lastname streetName streetNr zip city emails phones contacts")
        .populate("contacts._id",undefined,undefined,{select:"firstname lastname"});
    if(!contact) ctx.throw(404);

    contact = JSON.parse(JSON.stringify(contact));
    for(var c of contact.contacts){
        c.name = c._id.firstname+(c._id.lastname?(" "+c._id.lastname):"");
        c.id = c._id._id;
        delete c._id;
    }

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(contact);
}
