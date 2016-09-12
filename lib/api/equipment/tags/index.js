"use strict";

var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw");

module.exports = router.post("/find", ensurePermission("equipment_write"), require("./find")).post("/:tag", ensurePermission("equipment_write"), require("./rename")).routes();