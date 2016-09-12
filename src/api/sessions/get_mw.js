var get = require("./get");

module.exports = async function(ctx,next){
    var session = await get(ctx.app.db,ctx.cookies.get("session"));
    if(!session) ctx.throw(403);
    ctx.session = session;
    await next();
}
