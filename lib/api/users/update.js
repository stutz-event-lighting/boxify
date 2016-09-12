"use strict";

var parse = require("co-body");

module.exports = function _callee3(ctx) {
    var body, id, pull, add, permission;
    return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx));

                case 2:
                    body = _context3.sent;
                    id = parseFloat(ctx.params.id);

                    if (ctx.session.user != id && ctx.session.permissions.indexOf("users_write") < 0) ctx.throw(403);
                    pull = [];
                    add = [];

                    for (permission in body.permissions) {
                        if (ctx.session.permissions.indexOf(permission) >= 0) (body.permissions[permission] ? add : pull).push(permission);
                    }
                    _context3.next = 10;
                    return regeneratorRuntime.awrap(Promise.all([function _callee() {
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        if (pull.length) {
                                            _context.next = 2;
                                            break;
                                        }

                                        return _context.abrupt("return");

                                    case 2:
                                        _context.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.Contact.update({ _id: id }, { $pullAll: { "permissions": pull } }));

                                    case 4:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx), function _callee2() {
                        return regeneratorRuntime.async(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        if (add.length) {
                                            _context2.next = 2;
                                            break;
                                        }

                                        return _context2.abrupt("return");

                                    case 2:
                                        _context2.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.Contact.update({ _id: id }, { $addToSet: { "permissions": { $each: add } } }));

                                    case 4:
                                    case "end":
                                        return _context2.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx)]));

                case 10:
                    ctx.status = 200;

                case 11:
                case "end":
                    return _context3.stop();
            }
        }
    }, null, this);
};