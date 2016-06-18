var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw.js");

module.exports = router
	.post("/create",ensurePermission("customers_write"),require("./create.js"))
	.post("/find",ensurePermission("customers_read"),require("./find.js"))
	.get("/:id/delete",ensurePermission("customers_write"),require("./delete.js"))
	.routes();
