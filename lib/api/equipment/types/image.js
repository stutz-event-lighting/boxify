"use strict";

var mongo = require("mongodb");

module.exports = function _callee(ctx) {
    var store, data;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    store = new mongo.GridStore(ctx.app.db, parseFloat(ctx.params.id), parseFloat(ctx.params.id), "r", { root: "equipmentimages" });
                    _context.prev = 1;
                    _context.next = 4;
                    return regeneratorRuntime.awrap(store.open());

                case 4:
                    _context.next = 6;
                    return regeneratorRuntime.awrap(store.read());

                case 6:
                    data = _context.sent;
                    _context.next = 9;
                    return regeneratorRuntime.awrap(store.close());

                case 9:
                    _context.next = 16;
                    break;

                case 11:
                    _context.prev = 11;
                    _context.t0 = _context["catch"](1);

                    ctx.status = 302;
                    ctx.set("Location", "http://placehold.it/350x250");
                    return _context.abrupt("return");

                case 16:
                    ctx.set("Content-Type", "image/jpeg");
                    ctx.body = data;

                case 18:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this, [[1, 11]]);
};