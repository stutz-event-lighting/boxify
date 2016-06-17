var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw.js");

module.exports = router
	.post("/create",ensurePermission("equipment_write"),require("./create.js"))
	.get("/:id",ensurePermission("equipment_read"),require("./get.js"))
	.post("/:id",ensurePermission("equipment_write"),require("./update.js"))
	.get("/:item/container",ensurePermission("equipment_read"),require("./container.js"))
	.get("/:id/delete",ensurePermission("equipment_write"),require("./delete.js"))
	.routes();
