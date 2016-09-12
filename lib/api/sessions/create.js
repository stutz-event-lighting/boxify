"use strict";

var crypto = require("crypto");
var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, query, user, sessionid, session;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;

                    if (!(body.email && body.password)) {
                        _context.next = 7;
                        break;
                    }

                    query = { "emails.email": body.email, password: body.password };
                    _context.next = 12;
                    break;

                case 7:
                    if (!body.pin) {
                        _context.next = 11;
                        break;
                    }

                    query = { pin: body.pin };
                    _context.next = 12;
                    break;

                case 11:
                    return _context.abrupt("return", res.fail());

                case 12:
                    _context.next = 14;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.findOne(query).select("firstname lastname permissions"));

                case 14:
                    user = _context.sent;
                    sessionid = crypto.randomBytes(16).toString("hex");
                    _context.next = 18;
                    return regeneratorRuntime.awrap(ctx.app.db.Session.create({ _id: sessionid, user: user._id, permissions: user.permissions }));

                case 18:
                    session = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify({ _id: sessionid, user: user, permissions: user.permissions });

                case 21:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};