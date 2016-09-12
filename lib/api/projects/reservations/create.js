"use strict";

var mongo = require("mongodb");
module.exports = function _callee(ctx) {
    var id;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    console.log("here");
                    id = mongo.ObjectID();
                    _context.next = 4;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentReservation.create({
                        _id: id,
                        project: mongo.ObjectID(ctx.params.project),
                        items: {}
                    }));

                case 4:
                    ctx.body = id + "";

                case 5:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};