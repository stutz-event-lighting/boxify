"use strict";

var mongo = require("mongodb");
module.exports = function _callee2(ctx) {
    var type, id;
    return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    type = parseInt(ctx.params.type, 10);
                    id = parseInt(ctx.params.id, 10);
                    _context2.next = 4;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentItem.remove({ type: type, id: id }), function _callee() {
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        _context.next = 2;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.update({ _id: type }, { $inc: { count: -1 } }));

                                    case 2:
                                        _context.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.update({ _id: type, count: 0 }, { $unset: { hasItems: true } }));

                                    case 4:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx), ctx.app.db.EquipmentLog.create({ _id: mongo.ObjectID(), time: new Date().getTime(), type: type, id: id, event: "removed" })]));

                case 4:

                    ctx.status = 200;

                case 5:
                case "end":
                    return _context2.stop();
            }
        }
    }, null, this);
};