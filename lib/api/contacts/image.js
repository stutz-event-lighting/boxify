"use strict";

var mongo = require("mongodb");

module.exports = function _callee(ctx) {
    var select, roles, contact, store;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    if (!(ctx.params.contact == "own")) {
                        _context.next = 4;
                        break;
                    }

                    ctx.status = 301;
                    ctx.set("Location", "/public/logo.png");
                    return _context.abrupt("return");

                case 4:
                    select = { _id: parseFloat(ctx.params.contact) };

                    if (ctx.params.contact != ctx.session.user + "" && ctx.session.permissions.indexOf("contacts_write") < 0) {
                        roles = [];

                        if (ctx.session.permissions.indexOf("users_read") >= 0) roles.push("user");
                        if (ctx.session.permissions.indexOf("customers_read") >= 0) roles.push("customer");
                        if (ctx.session.permissions.indexOf("suppliers_read") >= 0) roles.push("supplier");
                        if (roles.length) select.roles = { $in: roles };
                    };

                    _context.next = 9;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.findOne(select));

                case 9:
                    contact = _context.sent;
                    _context.prev = 10;
                    store = new mongo.GridStore(ctx.app.db, parseFloat(ctx.params.contact), "", "r", { root: "contacts" });
                    _context.next = 14;
                    return regeneratorRuntime.awrap(store.open());

                case 14:
                    ctx.set("Content-Type", "image/jpeg");
                    _context.next = 17;
                    return regeneratorRuntime.awrap(store.read());

                case 17:
                    ctx.body = _context.sent;
                    _context.next = 20;
                    return regeneratorRuntime.awrap(store.close());

                case 20:
                    _context.next = 26;
                    break;

                case 22:
                    _context.prev = 22;
                    _context.t0 = _context["catch"](10);

                    ctx.set("Location", "http://placehold.it/350x250");
                    ctx.status = 302;

                case 26:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this, [[10, 22]]);
};