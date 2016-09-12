"use strict";

var router = require("koa-router")();
var mount = require("koa-mount");
var compose = require("koa-compose");
var ensurePermission = require("../../sessions/ensure_mw");

router.post("/create", ensurePermission("equipment_write"), require("./create")).get("/:id", ensurePermission("equipment_read"), require("./get")).post("/:id", ensurePermission("equipment_write"), require("./update")).get("/:item/container", ensurePermission("equipment_read"), require("./container")).get("/:id/delete", ensurePermission("equipment_write"), require("./delete"));

module.exports = function _callee2(ctx, next) {
	var prev;
	return regeneratorRuntime.async(function _callee2$(_context2) {
		while (1) {
			switch (_context2.prev = _context2.next) {
				case 0:
					prev = ctx.path;

					ctx.path = ctx.path.slice(("/" + ctx.params.type).length);
					_context2.next = 4;
					return regeneratorRuntime.awrap(router.routes()(ctx, function _callee() {
						return regeneratorRuntime.async(function _callee$(_context) {
							while (1) {
								switch (_context.prev = _context.next) {
									case 0:
										ctx.path = prev;
										_context.next = 3;
										return regeneratorRuntime.awrap(next());

									case 3:
									case "end":
										return _context.stop();
								}
							}
						}, null, this);
					}));

				case 4:
				case "end":
					return _context2.stop();
			}
		}
	}, null, this);
};