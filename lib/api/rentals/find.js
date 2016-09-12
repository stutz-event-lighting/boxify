"use strict";

var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, query, rentals;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    query = {};

                    if (body.search) {
                        query.name = { $regex: "^" + body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), $options: "i" };
                    }
                    _context.next = 7;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentRental.find(query).select("supplier name projects delivery return items status").populate("supplier", "firstname lastname").populate("projects", "name"));

                case 7:
                    rentals = _context.sent;


                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(rentals);

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};