"use strict";

module.exports = function _callee(ctx) {
    var id;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    id = parseFloat(ctx.params.user);

                    if (ctx.session.user != id && ctx.session.permissions.indexOf("users_write") < 0) ctx.throw(403);
                    _context.next = 4;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.Contact.update({ _id: id }, { $pull: { roles: "user" } }), ctx.app.db.Session.remove({ user: id })]));

                case 4:
                    ctx.status = 200;

                case 5:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};