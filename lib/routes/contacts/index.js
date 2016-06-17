var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw");
var getSession = require("../sessions/get_mw.js");

module.exports = router
	.post("/create",ensurePermission("contacts_write"),require("./create.js"))
	.post("/find",ensurePermission("contacts_read"),require("./find.js"))
	.get("/:contact",getSession,require("./get.js"))
	.post("/:contact",getSession,require("./update.js"))
	.get("/:contact/image",getSession,require("./image.js"))
	.post("/:contact/image",getSession,require("./updateImage.js"))
	.routes();
