var ensure = require("./ensure");

module.exports = function(permission){
    return async function(ctx,next){
        ctx.session = await ensure(ctx.app.db,ctx.cookies.get("session"),permission);
        await next();
    }
}
