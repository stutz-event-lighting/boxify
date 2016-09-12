"use strict";

var mongo = require("mongodb");
var calcReserved = require("../calculatereserved");
module.exports = function _callee(ctx) {
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentReservation.remove({ _id: mongo.ObjectID(ctx.params.reservation) }));

                case 2:
                    _context.next = 4;
                    return regeneratorRuntime.awrap(calcReserved(ctx.app.db, mongo.ObjectID(ctx.params.project)));

                case 4:
                    ctx.status = 200;

                case 5:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};