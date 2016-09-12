"use strict";

var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, regex, tags;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    regex = { $regex: "^" + (body.tag || "").replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), $options: "i" };
                    _context.next = 6;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentTag.find({ _id: regex }));

                case 6:
                    tags = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(tags.map(function (tag) {
                        return tag._id;
                    }));

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};