"use strict";

var findContact = require("../contacts/find");

module.exports = function _callee(ctx) {
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(findContact(ctx, "customer"));

                case 2:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};