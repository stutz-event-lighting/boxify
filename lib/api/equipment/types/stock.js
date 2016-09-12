"use strict";

var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function _callee2(ctx) {
    var body, type, results, items, i;
    return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context2.sent;
                    type = parseFloat(ctx.params.type);
                    _context2.next = 6;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentType.findOne({ _id: type }).select("count"), function _callee() {
                        var query;
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        if (body.loose) {
                                            _context.next = 2;
                                            break;
                                        }

                                        return _context.abrupt("return", []);

                                    case 2:
                                        query = {};

                                        query["contents." + type] = { $exists: true };
                                        _context.next = 6;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.find(query).select("contents"));

                                    case 6:
                                        return _context.abrupt("return", _context.sent);

                                    case 7:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx)]));

                case 6:
                    results = _context2.sent;
                    type = results[0];
                    items = results[1];

                    for (i = 0; i < items.length; i++) {
                        type.count -= items[i].contents[type._id + ""].count;
                    }
                    ctx.set("Content-Type", "application/json");
                    ctx.body = type.count + "";

                case 12:
                case "end":
                    return _context2.stop();
            }
        }
    }, null, this);
};