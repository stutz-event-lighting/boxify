"use strict";

module.exports = function _callee(db, project) {
    var entries, balance, i, entry, type, item, balanceitem, supplier;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(db.EquipmentIo.find({ project: project, draft: { $ne: true } }).select("items type"));

                case 2:
                    entries = _context.sent;
                    balance = {};

                    for (i = 0; i < entries.length; i++) {
                        entry = entries[i];

                        for (type in entry.items) {
                            item = entry.items[type];
                            balanceitem = balance[type];

                            if (!balanceitem) balance[type] = balanceitem = { count: 0, suppliers: {} };
                            if (entry.type == "checkin") {
                                balanceitem.count += item.count;
                            } else {
                                balanceitem.count -= item.count;
                            }
                            for (supplier in item.suppliers) {
                                if (!balanceitem.suppliers[supplier]) balanceitem.suppliers[supplier] = 0;
                                if (entry.type == "checkin") {
                                    balanceitem.suppliers[supplier] += item.suppliers[supplier].count;
                                } else {
                                    balanceitem.suppliers[supplier] -= item.suppliers[supplier].count;
                                }
                            }
                        }
                    }

                    _context.t0 = regeneratorRuntime.keys(balance);

                case 6:
                    if ((_context.t1 = _context.t0()).done) {
                        _context.next = 15;
                        break;
                    }

                    type = _context.t1.value;
                    item = balance[type];

                    if (item.count) {
                        _context.next = 12;
                        break;
                    }

                    delete balance[type];
                    return _context.abrupt("continue", 6);

                case 12:
                    for (supplier in item.suppliers) {
                        if (!item.suppliers[supplier]) {
                            delete item.suppliers[supplier];
                        }
                    }
                    _context.next = 6;
                    break;

                case 15:
                    _context.next = 17;
                    return regeneratorRuntime.awrap(db.Project.update({ _id: project }, { $set: { balance: balance } }));

                case 17:
                    return _context.abrupt("return", balance);

                case 18:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};