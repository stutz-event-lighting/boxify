"use strict";

module.exports = function _callee() {
    var db;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    db = this.db;
                    _context.next = 3;
                    return regeneratorRuntime.awrap(db.collection("equipmenttypes").update({ contents: "*" }, { $set: { contents: null } }, { multi: true }));

                case 3:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};