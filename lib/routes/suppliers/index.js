var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw.js");

module.exports = router
	.post("/create",ensurePermission("suppliers_write"),require("./create.js"))
	.post("/find",ensurePermission("suppliers_read"),require("./find.js"))
	.get("/:id/delete",ensurePermission("suppliers_write"),require("./delete.js"))
	.routes();
