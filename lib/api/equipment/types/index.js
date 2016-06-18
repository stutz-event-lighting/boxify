var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw.js");

module.exports = router
	.post("",ensurePermission("equipment_read"),require("./find.js"))
	.post("/create",ensurePermission("equipment_write"),require("./create.js"))
	.get("/:id",ensurePermission("equipment_read"),require("./get.js"))
	.post("/:id",ensurePermission("equipment_write"),require("./update.js"))
	.get("/:id/image",ensurePermission("equipment_read"),require("./image.js"))
	.get("/:type/name",ensurePermission("equipment_read"),require("./getname.js"))
	.post("/:type/count",ensurePermission("equipment_write"),require("./updatecount.js"))
	.post("/:type/stock",ensurePermission("equipment_read"),require("./stock.js"))
	.get("/:type/items",ensurePermission("equipment_read"),require("./items.js"))
	.get("/:type/graph/:from-:to",ensurePermission("equipment_read"),require("./graph.js"))
	.get("/:id/delete",ensurePermission("equipment_write"),require("./delete.js"))
	 .all("/:type/*",require("../items"))
	.routes()
