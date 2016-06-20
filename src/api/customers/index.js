var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw");

module.exports = router
	.post("/create",ensurePermission("customers_write"),require("./create"))
	.post("/find",ensurePermission("customers_read"),require("./find"))
	.get("/:id/delete",ensurePermission("customers_write"),require("./delete"))
	.routes();
