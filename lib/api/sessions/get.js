"use strict";

module.exports = function _callee(db, id) {
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(db.Session.findOne({ _id: id }).select("user permissions"));

                case 2:
                    return _context.abrupt("return", _context.sent);

                case 3:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};