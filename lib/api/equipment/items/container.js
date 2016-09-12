"use strict";

var mongo = require("mongodb");

module.exports = function _callee(ctx) {
    var query, item;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    query = {};

                    query["contents." + ctx.params.type + ".ids"] = ctx.params.item;
                    _context.next = 4;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentItem.findOne(query));

                case 4:
                    item = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = item ? item._id + "" : "null";

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};