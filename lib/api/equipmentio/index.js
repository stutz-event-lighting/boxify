"use strict";

var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw");

module.exports = router.post("", ensurePermission("projects_write"), require("./create")).get("/:io/checkout", ensurePermission("projects_read"), require("./checkout")).get("/:io/checkin", ensurePermission("projects_read"), require("./checkin")).post("/:io", ensurePermission("projects_write"), require("./update")).get("/:io/finish", ensurePermission("projects_write"), require("./finish")).get("/:io/pickupConfirmation.docx", ensurePermission("projects_read"), require("./pickupConfirmation")).get("/:io/delete", ensurePermission("projects_write"), require("./delete")).routes();