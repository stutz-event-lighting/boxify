var mongo = require("mongodb");

module.exports = async function(ctx){
    if(ctx.params.contact == "own"){
        ctx.status = 301;
        ctx.set("Location","/public/logo.png");
        return;
    }

    var select = {_id:parseFloat(ctx.params.contact)};
    if(ctx.params.contact != ctx.session.user+""&&ctx.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(ctx.session.permissions.indexOf("users_read")>=0) roles.push("user");
        if(ctx.session.permissions.indexOf("customers_read")>=0) roles.push("customer");
        if(ctx.session.permissions.indexOf("suppliers_read")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };

    var contact = await ctx.app.db.Contact.findOne(select);
    try{
        var store = new mongo.GridStore(ctx.app.db,parseFloat(ctx.params.contact),"","r",{root:"contacts"});
        await store.open();
        ctx.set("Content-Type","image/jpeg");
        ctx.body = await store.read();
        await store.close();
    }catch(e){
        ctx.set("Location","http://placehold.it/350x250");
        ctx.status = 302;
    }
}
