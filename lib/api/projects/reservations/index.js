"use strict";

var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw");

router.get("/create", ensurePermission("projects_write"), require("./create")).get("/:reservation", ensurePermission("projects_read"), require("./get")).post("/:reservation", ensurePermission("projects_write"), require("./update")).get("/:reservation/delete", ensurePermission("projects_write"), require("./delete"));

module.exports = function _callee(ctx, next) {
    var prev;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    prev = ctx.path;

                    ctx.path = ctx.path.slice(("/" + ctx.params.project + "/reservations").length);
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