var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw.js");

module.exports = router
	.post("/find",ensurePermission("equipment_write"),require("./find.js"))
	.post("/:tag",ensurePermission("equipment_write"),require("./rename.js"))
	.routes();
