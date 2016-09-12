var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw");

router
.get("/create",ensurePermission("projects_write"),require("./create"))
.get("/:reservation",ensurePermission("projects_read"),require("./get"))
.post("/:reservation",ensurePermission("projects_write"),require("./update"))
.get("/:reservation/delete",ensurePermission("projects_write"),require("./delete"));

module.exports = async function(ctx, next){
    var prev = ctx.path;
    ctx.path = ctx.path.slice(("/"+ctx.params.project+"/reservations").length);
    await router.routes()(ctx,async function(){
        ctx.path = prev;
        await next();
    });
}
