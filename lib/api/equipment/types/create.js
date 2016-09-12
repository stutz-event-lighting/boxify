"use strict";

var parse = require("co-body");
module.exports = function _callee(ctx) {
    var body, id;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    _context.next = 5;
                    return regeneratorRuntime.awrap(ctx.app.db.MainSettings.findByIdAndUpdate("main", { $inc: { nextEquipmenttypeId: 1 } }, { select: "nextEquipmenttypeId" }));

                case 5:
                    _context.t0 = _context.sent.nextEquipmenttypeId;

                    if (_context.t0) {
                        _context.next = 8;
                        break;
                    }

                    _context.t0 = 0;

                case 8:
                    id = _context.t0;
                    _context.next = 11;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.create({ _id: id, name: body.name, technicalDescription: "", count: 0, accessories: [], nextId: 1 }));

                case 11:
                    ctx.body = id + "";

                case 12:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};