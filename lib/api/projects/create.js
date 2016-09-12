"use strict";

var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function _callee(ctx) {
    var body, customer, c, id;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    customer = parseFloat(body.customer);
                    _context.next = 6;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.findOneAndUpdate({ _id: customer }, { $inc: { lastProjectNumber: 1 } }, { select: "lastProjectNumber", new: true }));

                case 6:
                    c = _context.sent;
                    id = mongo.ObjectID();
                    _context.next = 10;
                    return regeneratorRuntime.awrap(ctx.app.db.Project.create({ _id: id, customer: customer, projectNumber: c.lastProjectNumber, name: body.name, start: body.start, end: body.end, balance: {}, needs: {}, status: "ongoing" }));

                case 10:
                    ctx.body = id + "";

                case 11:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};