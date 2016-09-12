"use strict";

var mongo = require("mongodb");
module.exports = function _callee(ctx) {
    var count;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.count({ category: mongo.ObjectID(ctx.params.id) }));

                case 2:
                    count = _context.sent;

                    if (count) ctx.throw(400, "Category in use");
                    _context.next = 6;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentCategory.remove({ _id: mongo.ObjectID(ctx.params.id) }));

                case 6:
                    ctx.status = 200;

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};