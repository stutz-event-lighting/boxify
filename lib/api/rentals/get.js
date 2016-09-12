"use strict";

var mongo = require("mongodb");
var util = require("../../util");
var calcNeeded = require("../projects/calculateneeded");

module.exports = function _callee3(ctx) {
    var results, types, categories, rental, project, type;
    return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentType.find({}).select("name category"), ctx.app.db.EquipmentCategory.find({}).select("name"), function _callee() {
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        if (!(["newrequest", "newbooking", "newrental"].indexOf(ctx.params.rental) >= 0)) {
                                            _context.next = 2;
                                            break;
                                        }

                                        return _context.abrupt("return");

                                    case 2:
                                        _context.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentRental.findOne({ _id: mongo.ObjectID(ctx.params.rental) }).select("name items status supplier"));

                                    case 4:
                                        return _context.abrupt("return", _context.sent);

                                    case 5:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx), function _callee2() {
                        var results, project;
                        return regeneratorRuntime.async(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        if (ctx.query.project) {
                                            _context2.next = 2;
                                            break;
                                        }

                                        return _context2.abrupt("return");

                                    case 2:
                                        _context2.next = 4;
                                        return regeneratorRuntime.awrap(Promise.all([ctx.app.db.Project.findOne({ _id: mongo.ObjectID(ctx.query.project) }).select("start end"), calcNeeded(ctx.app.db, mongo.ObjectID(ctx.query.project))]));

                                    case 4:
                                        results = _context2.sent;
                                        project = JSON.parse(JSON.stringify(results[0]));

                                        project.needed = results[1];
                                        return _context2.abrupt("return", project);

                                    case 8:
                                    case "end":
                                        return _context2.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx)]));

                case 2:
                    results = _context3.sent;
                    types = util.createIndex(JSON.parse(JSON.stringify(results[0])), "_id");
                    categories = util.createIndex(results[1], "_id");
                    rental = results[2];
                    project = results[3];

                    if (!rental) {
                        _context3.next = 12;
                        break;
                    }

                    for (type in rental.items) {
                        types[type].count = rental.items[type].count;
                        types[type].ids = rental.items[type].ids;
                    }
                    delete rental.items;
                    _context3.next = 23;
                    break;

                case 12:
                    if (!project) {
                        _context3.next = 23;
                        break;
                    }

                    _context3.t0 = regeneratorRuntime.keys(project.needed);

                case 14:
                    if ((_context3.t1 = _context3.t0()).done) {
                        _context3.next = 22;
                        break;
                    }

                    type = _context3.t1.value;

                    if (!(project.needed[type] <= 0)) {
                        _context3.next = 18;
                        break;
                    }

                    return _context3.abrupt("continue", 14);

                case 18:
                    types[type].count = project.needed[type];
                    types[type].ids = [];
                    _context3.next = 14;
                    break;

                case 22:
                    rental = {
                        delivery: project.start,
                        return: project.end,
                        status: "requested"
                    };

                case 23:

                    //implement a logic where the 'count' property gets calculated for every type,
                    //if there is a 'project' parameter given to ctx route

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify({
                        types: types,
                        categories: categories,
                        rental: rental
                    });

                case 25:
                case "end":
                    return _context3.stop();
            }
        }
    }, null, this);
};