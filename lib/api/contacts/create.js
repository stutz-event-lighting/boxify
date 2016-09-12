"use strict";

var parse = require("co-body");

module.exports = function _callee(ctx) {
    var body, contact, types, settings;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context.sent;
                    contact = {};
                    types = ["person", "company", "club"];

                    if (types.indexOf(body.type) < 0) body.type = "person";
                    contact.type = body.type;

                    if (typeof body.firstname == "string" && body.firstname.length) {
                        contact.firstname = body.firstname;
                    }

                    if (body.type == "person" && typeof body.lastname == "string" && body.lastname.length) {
                        contact.lastname = body.lastname;
                    }

                    contact.emails = [];
                    contact.phones = [];
                    contact.contacts = [];

                    _context.next = 14;
                    return regeneratorRuntime.awrap(ctx.app.db.MainSettings.findByIdAndUpdate("main", { $inc: { nextContactId: 1 } }, { select: "nextContactId" }));

                case 14:
                    settings = _context.sent;

                    contact._id = settings.nextContactId || 0;

                    _context.next = 18;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.create(contact));

                case 18:
                    ctx.body = contact._id + "";

                case 19:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};