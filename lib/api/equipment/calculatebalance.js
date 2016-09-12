"use strict";

var util = require("../../util");

module.exports = function _callee(db) {
    var results, types, projects, rentals, type, i, project, t, item, supplier, rental;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(Promise.all([db.EquipmentType.find({}).select("count"), db.Project.find({ balance: { $ne: {} } }).select("balance"), db.EquipmentRental.find({ status: "received" }).select("items supplier")]));

                case 2:
                    results = _context.sent;
                    types = util.createIndex(JSON.parse(JSON.stringify(results[0])), "_id");
                    projects = results[1];
                    rentals = results[2];


                    for (type in types) {
                        type = types[type];
                        type.suppliers = { own: type.count };
                    }

                    for (i = 0; i < projects.length; i++) {
                        project = projects[i];

                        for (type in project.balance) {
                            t = types[type];
                            item = project.balance[type];

                            t.count += item.count;
                            for (supplier in item.suppliers) {
                                t.suppliers[supplier] = (t.suppliers[supplier] || 0) + item.suppliers[supplier];
                            }
                        }
                    }
                    for (i = 0; i < rentals.length; i++) {
                        rental = rentals[i];

                        for (type in rental.items) {
                            t = types[type];
                            item = rental.items[type];

                            t.count += item.count;
                            t.suppliers[rental.supplier + ""] = (t.suppliers[rental.supplier + ""] || 0) + item.count;
                        }
                    }
                    return _context.abrupt("return", types);

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};