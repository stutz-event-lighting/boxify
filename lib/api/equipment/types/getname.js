"use strict";

module.exports = function _callee(ctx) {
    var type;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.findOne({ _id: parseFloat(ctx.params.type) }).select("name"));

                case 2:
                    type = _context.sent;

                    ctx.body = type.name;

                case 4:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};