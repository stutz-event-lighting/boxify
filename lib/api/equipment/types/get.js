"use strict";

module.exports = function _callee4(ctx) {
    var id, d, item;
    return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    id = parseInt(ctx.params.id, 10);
                    _context4.next = 3;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentType.findOne({ _id: id }).select("name manufacturer manufacturerArticlenumber manufacturerEAN technicalDescription category tags count weight height width length rent factoryPrice contents").populate("contents"), function _callee() {
                        var query;
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        query = {};

                                        query["balance." + id] = { $exists: true };
                                        _context.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.Project.find(query).select("name end balance"));

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
                                        query = { end: { $gte: new Date().getTime() } };

                                        query["reserved." + id] = { $exists: true };
                                        _context2.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.Project.find(query).select("name start end reserved status"));

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
                                        query = { status: { $in: ["booked", "received"] } };

                                        query["items." + id] = { $exists: true };
                                        _context3.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentRental.find(query).select("name delivery return items status"));

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
                    d = _context4.sent;
                    item = JSON.parse(JSON.stringify(d[0]));

                    item.locations = d[1].map(function (project) {
                        return { _id: project._id, name: project.name, to: project.end, count: -project.balance[id].count };
                    });
                    item.reservations = d[2].map(function (project) {
                        return { _id: project._id, name: project.name, from: project.start, to: project.end, count: project.reserved[id] };
                    });
                    item.rentals = d[3].map(function (rental) {
                        return { _id: rental._id, name: rental.name, from: rental.delivery, to: rental.return, count: rental.items[id].count, status: rental.status };
                    });

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(item);

                case 10:
                case "end":
                    return _context4.stop();
            }
        }
    }, null, this);
};