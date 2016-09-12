"use strict";

module.exports = function _callee(ctx) {
    var categories;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentCategory.find({}, { _id: true, name: true }));

                case 2:
                    categories = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(categories);

                case 5:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};