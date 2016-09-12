"use strict";

var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, type, id, query;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    type = parseInt(ctx.params.type, 10);
                    id = parseInt(ctx.params.id, 10);
                    query = {};

                    if (body.remark) query.remark = body.remark;
                    if (body.serialnumber) query.serialnumber = body.serialnumber;
                    if (body.contents) query.contents = body.contents;

                    _context.next = 11;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentItem.update({ type: type, id: id }, { $set: query }));

                case 11:
                    ctx.status = 200;

                case 12:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};