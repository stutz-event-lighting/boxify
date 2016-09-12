"use strict";

module.exports = function _callee(ctx) {
    var id, user, permissions, permission, name;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    id = parseFloat(ctx.params.id);

                    if (ctx.session.permissions.indexOf("users_read") < 0 && id != ctx.session.user) ctx.throw(403);

                    _context.next = 4;
                    return regeneratorRuntime.awrap(ctx.app.db.Contact.findOne({ _id: id }).select("permissions"));

                case 4:
                    user = _context.sent;

                    if (!user) ctx.throw(404);
                    user = JSON.parse(JSON.stringify(user));
                    permissions = {};

                    for (permission in ctx.app.permissions) {
                        name = ctx.app.permissions[permission];

                        permissions[permission] = { name: name, allowed: user.permissions.indexOf(permission) >= 0 };
                    }
                    user.permissions = permissions;
                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify(user);

                case 12:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};