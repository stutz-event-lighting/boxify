"use strict";

var mongo = require("mongodb");
var util = require("../../util");
var calcNeeded = require("./calculateneeded");

module.exports = function _callee(ctx) {
    var id, results, reservations, i, reservation, needed, needsRental, type, ios, io;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    id = mongo.ObjectID(ctx.params.id);
                    _context.next = 3;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.Project.findOne({ _id: id }).select("name customer start end balance remark status"), ctx.app.db.EquipmentReservation.find({ project: id }).select("items"), calcNeeded(ctx.app.db, id), ctx.app.db.EquipmentIo.find({ project: id }).select("type time items user draft").populate("user", "firstname lastname").sort({ time: 1 })]));

                case 3:
                    results = _context.sent;
                    reservations = JSON.parse(JSON.stringify(results[1]));

                    for (i = 0; i < reservations.length; i++) {
                        reservation = reservations[i];

                        reservation.count = Object.keys(reservation.items).length;
                        reservation.total = Object.keys(reservation.items).map(function (type) {
                            return reservation.items[type];
                        }).concat([0]).reduce(function (prev, val) {
                            return prev + val;
                        });
                        delete reservation.items;
                    }

                    needed = results[2];
                    needsRental = false;
                    _context.t0 = regeneratorRuntime.keys(needed);

                case 9:
                    if ((_context.t1 = _context.t0()).done) {
                        _context.next = 16;
                        break;
                    }

                    type = _context.t1.value;

                    if (!(needed[type] > 0)) {
                        _context.next = 14;
                        break;
                    }

                    needsRental = true;
                    return _context.abrupt("break", 16);

                case 14:
                    _context.next = 9;
                    break;

                case 16:
                    ios = JSON.parse(JSON.stringify(results[3]));

                    for (i = 0; i < ios.length; i++) {
                        io = ios[i];

                        io.count = Object.keys(io.items).length;
                        io.total = Object.keys(io.items).map(function (type) {
                            return io.items[type].count;
                        }).concat([0]).reduce(function (prev, val) {
                            return prev + val;
                        });
                        delete io.items;
                    }

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify({
                        project: results[0],
                        reservations: reservations,
                        needsRental: needsRental,
                        io: ios
                    });

                case 20:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};