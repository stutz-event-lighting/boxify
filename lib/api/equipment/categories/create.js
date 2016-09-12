"use strict";

var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function _callee(ctx) {
    var body, category;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    _context.next = 5;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentCategory.create({ _id: new mongo.ObjectID(), name: body.name }));

                case 5:
                    category = _context.sent;

                    ctx.body = category._id + "";

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};