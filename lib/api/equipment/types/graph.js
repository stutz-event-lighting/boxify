"use strict";

var mongo = require("mongodb");

module.exports = function _callee4(ctx) {
    var type, results, logs, ios, reservations, rentals, supplies, demands, i, log, iosbyproject, io, reservationsbyproject, reservation, rental, projects, p, j, r, currentsupply, currentownsupply, supplytimeline, ownsupplytimeline, supply, currentdemand, demandtimeline, demand;
    return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    type = parseInt(ctx.params.type, 10);
                    _context4.next = 3;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentLog.find({ type: type, event: { $in: ["added", "removed"] } }).select("time count id event").sort({ time: -1 }), function _callee() {
                        var query;
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        query = { draft: { $ne: true } };

                                        query["items." + type] = { $exists: true };
                                        _context.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentIo.find(query).select("project type time items").sort({ time: -1 }));

                                    case 4:
                                        return _context.abrupt("return", _context.sent);

                                    case 5:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx), function _callee2() {
                        var query;
                        return regeneratorRuntime.async(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        query = {};

                                        query["items." + type] = { $exists: true };
                                        _context2.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentReservation.find(query).select("project status delivery return items").sort({ delivery: -1 }));

                                    case 4:
                                        return _context2.abrupt("return", _context2.sent);

                                    case 5:
                                    case "end":
                                        return _context2.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx), function _callee3() {
                        var query;
                        return regeneratorRuntime.async(function _callee3$(_context3) {
                            while (1) {
                                switch (_context3.prev = _context3.next) {
                                    case 0:
                                        query = {};

                                        query["items." + type] = { $exists: true };
                                        _context3.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentRental.find(query).select("status delivery return items").sort({ delivery: -1 }));

                                    case 4:
                                        return _context3.abrupt("return", _context3.sent);

                                    case 5:
                                    case "end":
                                        return _context3.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx)]));

                case 3:
                    results = _context4.sent;
                    logs = results[0];
                    ios = results[1];
                    reservations = results[2];
                    rentals = results[3];
                    supplies = [];
                    demands = [];


                    for (i = 0; i < logs.length; i++) {
                        log = logs[i];

                        supplies.push({ time: log.time, count: (log.count || 1) * (log.event == "added" ? 1 : -1) });
                    }

                    iosbyproject = {};

                    for (i = 0; i < ios.length; i++) {
                        io = ios[i];

                        if (!iosbyproject[io.project + ""]) iosbyproject[io.project + ""] = [];
                        iosbyproject[io.project + ""].push(io);
                        demands.push({ time: io.time, count: io.items[type].count * (io.type == "checkin" ? -1 : 1) });
                    }

                    reservationsbyproject = {};

                    for (i = 0; i < reservations.length; i++) {
                        reservation = reservations[i];

                        if (!reservationsbyproject[reservation.project + ""]) reservationsbyproject[reservation.project + ""] = [];
                        reservationsbyproject[reservation.project + ""].push(reservation);
                    }

                    for (i = 0; i < rentals.length; i++) {
                        rental = rentals[i];

                        supplies.push({ time: rental.delivery, count: rental.items[type].count, rented: true });
                        supplies.push({ time: rental.return, count: -rental.items[type].count, rented: true });
                    }

                    projects = {};

                    Object.keys(iosbyproject).concat(Object.keys(reservationsbyproject)).forEach(function (entry) {
                        projects[entry] = true;
                    });
                    projects = Object.keys(projects).map(function (project) {
                        return mongo.ObjectID(project);
                    });

                    _context4.next = 21;
                    return regeneratorRuntime.awrap(ctx.app.db.Project.find({ _id: { $in: projects } }).select("start end balance"));

                case 21:
                    projects = _context4.sent;


                    for (i = 0; i < projects.length; i++) {
                        p = projects[i];

                        if (p.balance[type]) demands.push({ time: p.end, count: p.balance[type].count });

                        reservations = reservationsbyproject[p._id + ""] || [];

                        for (j = 0; j < reservations.length; j++) {
                            r = reservations[j];

                            demands.push({ time: p.start, count: r.items[type] });
                            demands.push({ time: p.end, count: -r.items[type] });
                        }
                    }
                    supplies.sort(function (a, b) {
                        return a.time - b.time;
                    });
                    demands.sort(function (a, b) {
                        return a.time - b.time;
                    });

                    currentsupply = 0;
                    currentownsupply = 0;
                    supplytimeline = { 0: 0 };
                    ownsupplytimeline = { 0: 0 };


                    for (i = 0; i < supplies.length; i++) {
                        supply = supplies[i];

                        currentsupply += supply.count;
                        if (!supply.rented) currentownsupply += supply.count;
                        supplytimeline[supply.time] = currentsupply;
                        ownsupplytimeline[supply.time] = currentownsupply;
                    }

                    currentdemand = 0;
                    demandtimeline = { 0: 0 };

                    for (i = 0; i < demands.length; i++) {
                        demand = demands[i];

                        demandtimeline[demand.time] = currentdemand += demand.count;
                    }

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify({ supply: supplytimeline, ownsupply: ownsupplytimeline, demand: demandtimeline });

                case 35:
                case "end":
                    return _context4.stop();
            }
        }
    }, null, this);
};