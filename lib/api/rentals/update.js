"use strict";

var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;

                    if (ctx.params.rental.length != 24) ctx.params.rental = mongo.ObjectID() + "";
                    _context.next = 6;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentRental.update({ _id: mongo.ObjectID(ctx.params.rental) }, { $set: {
                            name: body.name,
                            supplier: parseFloat(body.supplier),
                            delivery: body.delivery,
                            return: body.return,
                            status: body.status,
                            items: body.items,
                            projects: body.projects || []
                        } }, { upsert: true }));

                case 6:
                    ctx.status = 200;

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};