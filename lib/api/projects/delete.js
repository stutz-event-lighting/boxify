"use strict";

var mongo = require("mongodb");

module.exports = function _callee(ctx) {
    var id;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    id = mongo.ObjectID(ctx.params.id);
                    _context.next = 3;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.collection("equipmentreservations").remove({ project: id }), ctx.app.db.collection("equipmentio").remove({ project: id }), ctx.app.db.collection("projects").remove({ _id: id })]));

                case 3:
                    ctx.status = 200;

                case 4:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};