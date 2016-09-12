"use strict";

var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, id, query;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    id = parseInt(ctx.params.type);
                    query = {};
                    _context.t0 = body.type;
                    _context.next = _context.t0 === "add" ? 8 : _context.t0 === "remove" ? 10 : 12;
                    break;

                case 8:
                    query.$inc = { count: body.count };
                    return _context.abrupt("break", 13);

                case 10:
                    query.$inc = { count: -body.count };
                    return _context.abrupt("break", 13);

                case 12:
                    return _context.abrupt("return", res.fail(601, "Invalid type"));

                case 13:
                    _context.next = 15;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentType.update({ _id: id }, query), ctx.app.db.EquipmentLog.create({ time: new Date().getTime(), type: id, count: body.count, event: body.type == "add" ? "added" : "removed" })]));

                case 15:
                    ctx.status = 200;

                case 16:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};