"use strict";

var ensure = require("./ensure");

module.exports = function (permission) {
    return function _callee(ctx, next) {
        return regeneratorRuntime.async(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return regeneratorRuntime.awrap(ensure(ctx.app.db, ctx.cookies.get("session"), permission));

                    case 2:
                        ctx.session = _context.sent;
                        _context.next = 5;
                        return regeneratorRuntime.awrap(next());

                    case 5:
                    case "end":
                        return _context.stop();
                }
            }
        }, null, this);
    };
};