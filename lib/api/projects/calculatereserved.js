"use strict";

module.exports = function _callee(db, project) {
    var reservations, types, i, reservation, type;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(db.EquipmentReservation.find({ project: project }).select("items"));

                case 2:
                    reservations = _context.sent;
                    types = {};

                    for (i = 0; i < reservations.length; i++) {
                        reservation = reservations[i];

                        for (type in reservation.items) {
                            if (!types[type]) types[type] = 0;
                            types[type] += reservation.items[type];
                        }
                    }
                    _context.next = 7;
                    return regeneratorRuntime.awrap(db.Project.update({ _id: project }, { $set: { reserved: types } }));

                case 7:
                    return _context.abrupt("return", types);

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};