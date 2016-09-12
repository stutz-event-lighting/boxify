"use strict";

var get = require("./get_mw");
var compose = require("koa-compose");
module.exports = compose([get, function _callee(ctx) {
    var user;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.findOne({ _id: ctx.session.user }).select("firstname lastname"));

                case 2:
                    user = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify({ _id: ctx.session.id, permissions: ctx.session.permissions, user: user });

                case 5:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}]);