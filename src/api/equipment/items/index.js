var router = require("koa-router")();
var mount = require("koa-mount");
var compose = require("koa-compose");
var ensurePermission = require("../../sessions/ensure_mw");

router
.post("/create",ensurePermission("equipment_write"),require("./create"))
.get("/:id",ensurePermission("equipment_read"),require("./get"))
.post("/:id",ensurePermission("equipment_write"),require("./update"))
.get("/:item/container",ensurePermission("equipment_read"),require("./container"))
.get("/:id/delete",ensurePermission("equipment_write"),require("./delete"))

module.exports = async function(ctx,next){
	var prev = ctx.path;
	ctx.path = ctx.path.slice(("/"+ctx.params.type).length);
	await router.routes()(ctx,async function(){
		ctx.path = prev;
		await next();
	});	
}
