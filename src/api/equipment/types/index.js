var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw");

module.exports = router
	.post("",ensurePermission("equipment_read"),require("./find"))
	.post("/create",ensurePermission("equipment_write"),require("./create"))
	.get("/:id",ensurePermission("equipment_read"),require("./get"))
	.post("/:id",ensurePermission("equipment_write"),require("./update"))
	.get("/:id/image",ensurePermission("equipment_read"),require("./image"))
	.get("/:type/name",ensurePermission("equipment_read"),require("./getname"))
	.post("/:type/count",ensurePermission("equipment_write"),require("./updatecount"))
	.post("/:type/stock",ensurePermission("equipment_read"),require("./stock"))
	.get("/:type/items",ensurePermission("equipment_read"),require("./items"))
	.get("/:type/graph/:from-:to",ensurePermission("equipment_read"),require("./graph"))
	.get("/:id/delete",ensurePermission("equipment_write"),require("./delete"))
	 .all("/:type/*",require("../items"))
	.routes()
