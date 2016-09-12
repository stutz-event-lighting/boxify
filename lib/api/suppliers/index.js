"use strict";

var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw");

module.exports = router.post("/create", ensurePermission("suppliers_write"), require("./create")).post("/find", ensurePermission("suppliers_read"), require("./find")).get("/:id/delete", ensurePermission("suppliers_write"), require("./delete")).routes();