"use strict";

module.exports = function _callee(ctx) {
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(ctx.app.db.Session.remove({ _id: ctx.cookies.get("session") }));

                case 2:
                    ctx.status = 200;

                case 3:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};