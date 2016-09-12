"use strict";

var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw");

module.exports = router.post("", ensurePermission("rentals_read"), require("./find")).get("/:rental", ensurePermission("rentals_read"), require("./get")).post("/:rental", ensurePermission("rentals_write"), require("./update")).post("/:rental/updatestatus", ensurePermission("rentals_write"), require("./updatestatus")).get("/:rental/delete", ensurePermission("rentals_write"), require("./delete")).routes();