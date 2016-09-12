"use strict";

var mongo = require("mongodb");
var util = require("../../util");
var calcBalance = require("../equipment/calculatebalance");

module.exports = function _callee(ctx) {
    var results, categories, types, balance, checkout, items, history, project, reservation, type, supplier;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentCategory.find({}).select("name"), ctx.app.db.EquipmentType.find({}).select("name category"), calcBalance(ctx.app.db), ctx.app.db.EquipmentIo.findOne({ _id: mongo.ObjectID(ctx.params.io) }).select("person project items history draft reservation").populate("project", "balance").populate("reservation", "items")]));

                case 2:
                    results = _context.sent;
                    categories = util.createIndex(results[0], "_id");
                    types = util.createIndex(JSON.parse(JSON.stringify(results[1])), "_id");
                    balance = results[2];
                    checkout = results[3];
                    items = checkout.items;
                    history = checkout.history;
                    project = checkout.project;
                    reservation = checkout.reservation;

                    checkout.project = checkout.project._id;
                    if (checkout.reservation) checkout.reservation = checkout.reservation._id;

                    for (type in types) {
                        if (balance[type]) {
                            types[type].available = balance[type].count;
                            types[type].suppliers = {};
                            for (supplier in balance[type].suppliers) {
                                types[type].suppliers[supplier] = { available: balance[type].suppliers[supplier] };
                            }
                        }
                        if (items && items[type]) {
                            types[type].count = items[type].count;
                            types[type].available = (types[type].available || 0) + cap(types[type].count, project.balance[type] ? project.balance[type].count : 0);
                            if (!types[type].suppliers) types[type].suppliers = {};
                            for (supplier in items[type].suppliers) {
                                if (!types[type].suppliers[supplier]) types[type].suppliers[supplier] = { available: 0 };
                                types[type].suppliers[supplier].count = items[type].suppliers[supplier].count;
                                types[type].suppliers[supplier].available += cap(items[type].suppliers[supplier].count, project.balance[type] && project.balance[type].suppliers[supplier] ? -project.balance[type].suppliers[supplier] : 0);
                                types[type].suppliers[supplier].ids = items[type].suppliers[supplier].ids;
                            }
                        }
                        if (reservation && reservation.items[type]) {
                            types[type].needed = reservation.items[type];
                        }
                    }

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify({
                        person: checkout.person,
                        draft: checkout.draft,
                        categories: categories,
                        types: types,
                        history: history
                    });

                case 16:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};

function cap(x, y) {
    return x;
    if (x < y) return x;
    return y;
}