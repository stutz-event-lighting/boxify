"use strict";

var mongo = require("mongodb");
var calculateBalance = require("../projects/calculatebalance");

module.exports = function _callee(ctx) {
    var id, io;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    id = mongo.ObjectID(ctx.params.io);
                    _context.next = 3;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentIo.findOne({ _id: id }).select("project"));

                case 3:
                    io = _context.sent;
                    _context.next = 6;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentIo.remove({ _id: id }));

                case 6:
                    _context.next = 8;
                    return regeneratorRuntime.awrap(calculateBalance(ctx.app.db, io.project));

                case 8:
                    ctx.status = 200;

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};