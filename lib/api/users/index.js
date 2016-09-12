"use strict";

var router = require("koa-router")();
var getSession = require("../sessions/get_mw");
var ensurePermission = require("../sessions/ensure_mw");

module.exports = router.post("/create", ensurePermission("users_write"), require("./create")).post("/find", ensurePermission("users_read"), require("./find")).get("/:id", getSession, require("./get")).post("/:id/save", getSession, require("./update")).post("/:user/password", getSession, require("./setpassword")).get("/:user/delete", getSession, require("./delete")).routes();