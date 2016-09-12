"use strict";

var parse = require("co-body");
module.exports = function _callee(ctx, role) {
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
                                $or: [{ firstname: { $regex: words[i], $options: "i" } }, { lastname: { $regex: words[i], $options: "i" } }]
                            });
                        }
                        if (needed.length) {
                            query.$and = needed;
                        }
                    }
                    if (body.role) {
                        query.roles = body.role;
                    }
                    if (body.type) {
                        query.type = body.type;
                    }
                    if (typeof role == "string") {
                        query.roles = role;
                    }
                    _context.next = 10;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.find(query, "firstname lastname"));

                case 10:
                    items = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(items);

                case 13:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};