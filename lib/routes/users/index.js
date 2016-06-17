var router = require("koa-router")();
var getSession = require("../sessions/get_mw.js");
var ensurePermission = require("../sessions/ensure_mw.js");

module.exports = router
	.post("/create",ensurePermission("users_write"),require("./create.js"))
	.post("/find",ensurePermission("users_read"),require("./find.js"))
	.get("/:id",getSession,require("./get.js"))
	.post("/:id/save",getSession,require("./update.js"))
	.post("/:user/password",getSession,require("./setpassword.js"))
	.get("/:user/delete",getSession,require("./delete.js"))
	.routes();
