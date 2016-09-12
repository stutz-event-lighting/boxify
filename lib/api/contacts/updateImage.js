"use strict";

var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, select, roles, contact, parts, mime, data, store;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx, { limit: "10mb" }));

                case 2:
                    body = _context.sent;
                    select = { _id: parseFloat(ctx.params.contact) };

                    if (ctx.params.contact != ctx.session.user + "" && ctx.session.permissions.indexOf("contacts_write") < 0) {
                        roles = [];

                        if (ctx.session.permissions.indexOf("users_write") >= 0) roles.push("user");
                        if (ctx.session.permissions.indexOf("customers_write") >= 0) roles.push("customer");
                        if (ctx.session.permissions.indexOf("suppliers_write") >= 0) roles.push("supplier");
                        if (roles.length) select.roles = { $in: roles };
                    };
                    _context.next = 8;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.findOne(select));

                case 8:
                    contact = _context.sent;
                    parts = body.image.split(",");
                    mime = parts[0].substring(5, parts[0].length - 7);
                    data = new Buffer(parts[1], "base64");
                    store = new mongo.GridStore(ctx.app.db.db, parseFloat(ctx.params.contact), "", "w", { root: "contacts", content_type: mime });
                    _context.next = 15;
                    return regeneratorRuntime.awrap(store.open());

                case 15:
                    _context.next = 17;
                    return regeneratorRuntime.awrap(store.write(data, true));

                case 17:
                    ctx.status = 200;

                case 18:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};