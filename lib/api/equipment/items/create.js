"use strict";

var parse = require("co-body");
var mongo = require("mongodb");

module.exports = function _callee(ctx) {
    var type;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    type = parseInt(ctx.params.type, 10);
                    _context.next = 3;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.findOneAndUpdate({ _id: type }, { $inc: { nextId: 1, count: 1 }, $set: { hasItems: true } }, { select: "nextId" }));

                case 3:
                    type = _context.sent;
                    _context.next = 6;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentItem.create({ _id: mongo.ObjectID(), id: type.nextId, type: type._id, status: "normal", serialnumber: "", remark: "", contents: {} }), ctx.app.db.EquipmentLog.create({ _id: mongo.ObjectID(), time: new Date().getTime(), type: type._id, id: type.nextId, event: "added" })]));

                case 6:
                    ctx.body = type.nextId;

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};