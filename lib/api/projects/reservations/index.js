"use strict";

var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw");

router.get("/create", ensurePermission("projects_write"), require("./create")).get("/:reservation", ensurePermission("projects_read"), require("./get")).post("/:reservation", ensurePermission("projects_write"), require("./update")).get("/:reservation/delete", ensurePermission("projects_write"), require("./delete"));

module.exports = function _callee2(ctx, next) {
    var prev;
    return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    prev = ctx.path;

                    console.log(prev);
                    ctx.path = ctx.path.slice(("/" + ctx.params.project + "/reservations").length);
                    console.log(ctx.path);
                    _context2.next = 6;
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

                case 6:
                case "end":
                    return _context2.stop();
            }
        }
    }, null, this);
};