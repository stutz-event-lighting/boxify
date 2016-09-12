var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx,{limit:"10mb"});

    var select = {_id:parseFloat(ctx.params.contact)};
    if(ctx.params.contact != ctx.session.user+""&&ctx.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(ctx.session.permissions.indexOf("users_write")>=0) roles.push("user");
        if(ctx.session.permissions.indexOf("customers_write")>=0) roles.push("customer");
        if(ctx.session.permissions.indexOf("suppliers_write")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };
    var contact = await ctx.app.db.Contact.findOne(select);
    var parts = body.image.split(",");
    var mime = parts[0].substring(5,parts[0].length-7);
    var data = new Buffer(parts[1],"base64");
    var store = new mongo.GridStore(ctx.app.db.db,parseFloat(ctx.params.contact),"","w",{root:"contacts",content_type:mime});
    await store.open();
    await store.write(data,true);
    ctx.status = 200;
}
