module.exports = async function(ctx){
    var id = parseFloat(ctx.params.id);
    if(ctx.session.permissions.indexOf("users_read") < 0 && id != ctx.session.user) ctx.throw(403);

    var user = await ctx.app.db.Contact.findOne({_id:id}).select("permissions");
    if(!user) ctx.throw(404);
    user = JSON.parse(JSON.stringify(user));
    var permissions = {};
    for(var permission in ctx.app.permissions){
        var name = ctx.app.permissions[permission];
        permissions[permission] = {name:name,allowed:user.permissions.indexOf(permission) >= 0};
    }
    user.permissions = permissions;
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(user);
}
