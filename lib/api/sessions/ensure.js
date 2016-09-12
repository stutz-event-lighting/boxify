"use strict";

var get = require("./get");

module.exports = function _callee(db, id, permission) {
    var session;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(get(db, id));

                case 2:
                    session = _context.sent;

                    if (session) {
                        _context.next = 5;
                        break;
                    }

                    throw new Error("permission denied");

                case 5:
                    if (!(session.permissions.indexOf(permission) < 0)) {
                        _context.next = 7;
                        break;
                    }

                    throw new Error("Insufficient Permissions");

                case 7:
                    return _context.abrupt("return", session);

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};