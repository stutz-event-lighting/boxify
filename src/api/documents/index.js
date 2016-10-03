var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw");

module.exports = router
	.get("",ensurePermission("equipment_read"),require("./find"))
	.post("",ensurePermission("equipment_write"),require("./upload"))
	.get("/:document",ensurePermission("equipment_read"),require("./download"))
	.delete("/:document",ensurePermission("equipment_write"),require("./delete"))
	.routes()
