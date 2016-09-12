"use strict";

var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, id;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    id = parseFloat(ctx.params.user);

                    if (ctx.session.user != id && ctx.session.permissions.indexOf("users_write") < 0) ctx.throw(403);
                    _context.next = 7;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.update({ _id: id }, { $set: { password: body.password } }));

                case 7:
                    ctx.status = 200;

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};