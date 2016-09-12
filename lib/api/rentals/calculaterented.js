"use strict";

module.exports = function _callee(db) {
    var rentals, types, i, rental, type, item, supplier;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(db.EquipmentRental.find({ status: "received" }).select("supplier items"));

                case 2:
                    rentals = _context.sent;
                    types = {};

                    for (i = 0; i < rentals.length; i++) {
                        rental = rentals[i];

                        for (type in rental.items) {
                            item = rental.items[type];

                            if (!types[type]) types[type] = { count: 0, suppliers: {} };
                            types[type].count += item.count;

                            supplier = types[type].suppliers[rental.supplier + ""];

                            if (!supplier) types[type].suppliers[rental.supplier + ""] = supplier = { count: 0, ids: [] };
                            supplier.count += item.count;
                            supplier.ids = supplier.ids.concat(item.ids);
                        }
                    }
                    return _context.abrupt("return", types);

                case 6:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};