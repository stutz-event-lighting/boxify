var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw");
var getSession = require("../sessions/get_mw");

module.exports = router
	.post("/create",ensurePermission("contacts_write"),require("./create"))
	.post("/find",ensurePermission("contacts_read"),require("./find"))
	.get("/:contact",getSession,require("./get"))
	.post("/:contact",getSession,require("./update"))
	.get("/:contact/image",getSession,require("./image"))
	.post("/:contact/image",getSession,require("./updateImage"))
	.routes();
