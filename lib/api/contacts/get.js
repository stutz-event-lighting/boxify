"use strict";

var util = require("../../util");
var parse = require("co-body");
module.exports = function _callee(ctx) {
    var select, roles, contact, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, c;

    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    select = { _id: parseFloat(ctx.params.contact) };

                    if (ctx.params.contact != ctx.session.user + "" && ctx.session.permissions.indexOf("contacts_write") < 0) {
                        roles = [];

                        if (ctx.session.permissions.indexOf("users_read") >= 0) roles.push("user");
                        if (ctx.session.permissions.indexOf("customers_read") >= 0) roles.push("customer");
                        if (ctx.session.permissions.indexOf("suppliers_read") >= 0) roles.push("supplier");
                        if (roles.length) select.roles = { $in: roles };
                    };
                    _context.next = 5;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.findOne(select).select("type salutation firstname lastname streetName streetNr zip city emails phones contacts").populate("contacts._id", undefined, undefined, { select: "firstname lastname" }));

                case 5:
                    contact = _context.sent;

                    if (!contact) ctx.throw(404);

                    contact = JSON.parse(JSON.stringify(contact));
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context.prev = 11;
                    for (_iterator = contact.contacts[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        c = _step.value;

                        c.name = c._id.firstname + (c._id.lastname ? " " + c._id.lastname : "");
                        c.id = c._id._id;
                        delete c._id;
                    }

                    _context.next = 19;
                    break;

                case 15:
                    _context.prev = 15;
                    _context.t0 = _context["catch"](11);
                    _didIteratorError = true;
                    _iteratorError = _context.t0;

                case 19:
                    _context.prev = 19;
                    _context.prev = 20;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 22:
                    _context.prev = 22;

                    if (!_didIteratorError) {
                        _context.next = 25;
                        break;
                    }

                    throw _iteratorError;

                case 25:
                    return _context.finish(22);

                case 26:
                    return _context.finish(19);

                case 27:
                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(contact);

                case 29:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this, [[11, 15, 19, 27], [20,, 22, 26]]);
};