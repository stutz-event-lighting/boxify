"use strict";

var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function _callee(ctx) {
    var body, io;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;

                    body.project = mongo.ObjectID(body.project);
                    io = {
                        _id: mongo.ObjectID(),
                        type: ["checkout", "checkin"].indexOf(body.type) >= 0 ? body.type : "checkout",
                        project: body.project,
                        draft: true,
                        delivered: true,
                        items: {},
                        history: []
                    };

                    if (body.reservation) {
                        io.reservation = mongo.ObjectID(body.reservation);
                    }
                    _context.next = 8;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentIo.create(io));

                case 8:
                    ctx.body = io._id + "";

                case 9:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};