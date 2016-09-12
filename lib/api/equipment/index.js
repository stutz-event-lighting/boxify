"use strict";

var compose = require("koa-compose");
var mount = require("koa-mount");

module.exports = compose([mount("/categories", require("./categories")), mount("/tags", require("./tags")), require("./types")]);