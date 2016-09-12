"use strict";

var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, query, words, needed, i, items;
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
                        words = body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/\s\s+/g, " ").split(" ");
                        needed = [];

                        for (i = 0; i < words.length; i++) {
                            needed.push({
                                $or: [{ name: { $regex: words[i], $options: "i" } }, { manufacturer: { $regex: words[i], $options: "i" } }, { tags: { $regex: words[i], $options: "i" } }]
                            });
                        }
                        if (needed.length) {
                            query.$and = needed;
                        }
                    }
                    _context.next = 7;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.find(query).select("name manufacturer category count weight height width length"));

                case 7:
                    items = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(items);

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};