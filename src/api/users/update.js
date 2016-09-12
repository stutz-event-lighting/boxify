var parse = require("co-body");

module.exports = async function(ctx){

    var body = await parse.json(ctx);

    var id = parseFloat(ctx.params.id);
    if(ctx.session.user != id && ctx.session.permissions.indexOf("users_write") < 0) ctx.throw(403);
    var pull = [];
    var add = [];
    for(var permission in body.permissions){
        if(ctx.session.permissions.indexOf(permission) >= 0) (body.permissions[permission]?add:pull).push(permission);
    }
    await Promise.all([
        async function(){
            if(!pull.length) return;
            await ctx.app.db.Contact.update({_id:id},{$pullAll:{"permissions":pull}})
        }.call(ctx),
        async function(){
            if(!add.length) return;
            await ctx.app.db.Contact.update({_id:id},{$addToSet:{"permissions":{$each:add}}})
        }.call(ctx)
    ])
    ctx.status = 200;
}
