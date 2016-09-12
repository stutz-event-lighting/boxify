"use strict";

var mongo = require("mongodb");
var calcProjReservations = require("../calculatereserved");
var parse = require("co-body");

module.exports = function _callee(ctx) {
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.t0 = regeneratorRuntime;
                    _context.t1 = ctx.app.db.EquipmentReservation;
                    _context.t2 = { _id: mongo.ObjectID(ctx.params.reservation) };
                    _context.next = 5;
                    return regeneratorRuntime.awrap(parse(ctx));

                case 5:
                    _context.t3 = _context.sent;
                    _context.t4 = {
                        items: _context.t3
                    };
                    _context.t5 = {
                        $set: _context.t4
                    };
                    _context.t6 = _context.t1.update.call(_context.t1, _context.t2, _context.t5);
                    _context.next = 11;
                    return _context.t0.awrap.call(_context.t0, _context.t6);

                case 11:
                    _context.next = 13;
                    return regeneratorRuntime.awrap(calcProjReservations(ctx.app.db, mongo.ObjectID(ctx.params.project)));

                case 13:
                    ctx.status = 200;

                case 14:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};