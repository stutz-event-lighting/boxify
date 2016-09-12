"use strict";

var router = require("koa-router")();

module.exports = router.post("/create", require("./create")).get("", require("./get_api")).get("/delete", require("./delete")).routes();