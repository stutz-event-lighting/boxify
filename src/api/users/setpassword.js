var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var id = parseFloat(ctx.params.user);
    if(ctx.session.user != id && ctx.session.permissions.indexOf("users_write") < 0) ctx.throw(403);
    await ctx.app.db.Contact.update({_id:id},{$set:{password:body.password}});
    ctx.status = 200;
}
