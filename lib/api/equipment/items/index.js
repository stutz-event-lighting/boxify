"use strict";

var router = require("koa-router")();
var mount = require("koa-mount");
var compose = require("koa-compose");
var ensurePermission = require("../../sessions/ensure_mw");

router.post("/create", ensurePermission("equipment_write"), require("./create")).get("/:id", ensurePermission("equipment_read"), require("./get")).post("/:id", ensurePermission("equipment_write"), require("./update")).get("/:item/container", ensurePermission("equipment_read"), require("./container")).get("/:id/delete", ensurePermission("equipment_write"), require("./delete"));

module.exports = function _callee(ctx, next) {
	var prev;
	return regeneratorRuntime.async(function _callee$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					prev = ctx.path;

					ctx.path = ctx.path.slice(("/" + ctx.params.type).length);
					_context.next = 4;
					return regeneratorRuntime.awrap(router.routes());

				case 4:
					ctx.path = prev;
					_context.next = 7;
					return regeneratorRuntime.awrap(next());

				case 7:
				case "end":
					return _context.stop();
			}
		}
	}, null, this);
};