"use strict";

var mongo = require("mongodb");

var calcBalance = require("../projects/calculatebalance");
var calcReservations = require("../projects/calculatereserved");

module.exports = function _callee2(ctx) {
    var io, reservation, type;
    return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentIo.findOne({ _id: mongo.ObjectID(ctx.params.io) }).select("project items reservation history"));

                case 2:
                    io = _context2.sent;

                    if (!io.reservation) {
                        _context2.next = 15;
                        break;
                    }

                    _context2.next = 6;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentReservation.findOne({ _id: io.reservation }).select("items"));

                case 6:
                    reservation = _context2.sent;


                    for (type in reservation.items) {
                        if (io.items[type]) reservation.items[type] -= io.items[type].count || 0;
                        if (reservation.items[type] <= 0) delete reservation.items[type];
                    }

                    if (!Object.keys(reservation.items).length) {
                        _context2.next = 13;
                        break;
                    }

                    _context2.next = 11;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentReservation.update({ _id: io.reservation }, { $set: { items: reservation.items } }));

                case 11:
                    _context2.next = 15;
                    break;

                case 13:
                    _context2.next = 15;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentReservation.remove({ _id: io.reservation }));

                case 15:
                    _context2.next = 17;
                    return regeneratorRuntime.awrap(Promise.all(io.history.map(function _callee(entry) {
                        var query, id, item, op;
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        if (!(io.type != "checkout")) {
                                            _context.next = 2;
                                            break;
                                        }

                                        return _context.abrupt("return");

                                    case 2:
                                        query = {};


                                        if (entry.source) {
                                            query.id = entry.source.item;
                                            query.type = entry.source.type;
                                        } else {
                                            id = Object.keys(entry.items)[0];

                                            query["contents." + entry.type + ".ids"] = id;
                                        }

                                        _context.next = 6;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentItem.findOne(query).select("contents"));

                                    case 6:
                                        item = _context.sent;

                                        if (item.contents[entry.type].count - entry.count > 0) {
                                            op = { $inc: {} };

                                            op.$inc["contents." + entry.type + ".count"] = -entry.count;
                                            if (id) {
                                                op.$pull = {};
                                                op.$pull["contents." + entry.type + ".ids"] = id;
                                            }
                                        } else {
                                            op = { $unset: {} };

                                            op.$unset["contents." + entry.type] = true;
                                        }
                                        _context.next = 10;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentItem.update(query, op));

                                    case 10:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, null, this);
                    })));

                case 17:
                    _context2.next = 19;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentIo.update({ _id: io._id }, { $set: { user: ctx.session.user, time: new Date().getTime() }, $unset: { draft: true, reservation: true } }));

                case 19:
                    _context2.next = 21;
                    return regeneratorRuntime.awrap(Promise.all([calcBalance(ctx.app.db, io.project), calcReservations(ctx.app.db, io.project)]));

                case 21:

                    ctx.status = 200;

                case 22:
                case "end":
                    return _context2.stop();
            }
        }
    }, null, this);
};