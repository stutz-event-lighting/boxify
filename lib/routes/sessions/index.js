var router = require("koa-router")();

module.exports = router
	.post("/create",require("./create.js"))
	.get("",require("./get_api.js"))
	.get("/delete",require("./delete.js"))
	.routes();
