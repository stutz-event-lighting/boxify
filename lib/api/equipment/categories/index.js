"use strict";

var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw");

module.exports = router.get("", ensurePermission("equipment_read"), require("./find")).post("/create", ensurePermission("equipment_write"), require("./create")).post("/:id", ensurePermission("equipment_write"), require("./update")).get("/:id/delete", ensurePermission("equipment_write"), require("./delete")).routes();