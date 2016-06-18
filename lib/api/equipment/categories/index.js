var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw.js");

module.exports = router
	.get("",ensurePermission("equipment_read"),require("./find.js"))
	.post("/create",ensurePermission("equipment_write"),require("./create.js"))
	.post("/:id",ensurePermission("equipment_write"),require("./update.js"))
	.get("/:id/delete",ensurePermission("equipment_write"),require("./delete.js"))
	.routes();
