"use strict";

var get = require("./get");

module.exports = function _callee(ctx, next) {
    var session;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(get(ctx.app.db, ctx.cookies.get("session")));

                case 2:
                    session = _context.sent;

                    if (!session) ctx.throw(403);
                    ctx.session = session;
                    _context.next = 7;
                    return regeneratorRuntime.awrap(next());

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};