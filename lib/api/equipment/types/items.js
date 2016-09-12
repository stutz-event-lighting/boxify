"use strict";

module.exports = function _callee(ctx) {
    var id, stock;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    id = parseInt(ctx.params.type, 10);
                    _context.next = 3;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentItem.find({ type: id }).select("id name"));

                case 3:
                    stock = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(stock);

                case 6:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};