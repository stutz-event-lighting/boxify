"use strict";

var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function _callee(ctx) {
    var body, query, projects;
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
                    if (body.finished !== true) {
                        query.status = "ongoing";
                    }
                    _context.next = 8;
                    return regeneratorRuntime.awrap(ctx.app.db.Project.find(query).select("name customer start end status").populate("customer", "firstname lastname").sort({ start: 1 }));

                case 8:
                    projects = _context.sent;


                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(projects);

                case 11:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};