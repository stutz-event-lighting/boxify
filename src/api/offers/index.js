var router = require("koa-router")();
var getSession = require("../sessions/get_mw");
var ensurePermission = require("../sessions/ensure_mw");

module.exports = router
	.get("",require("./search"))
	.post("",require("./create"))
	.get("/:offer",require("./get"))
	.put("/:offer",require("./update"))
	.delete("/:offer",require("./delete"))
	.middleware()
