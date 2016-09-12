"use strict";

module.exports = function _callee(ctx) {
    var id;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    id = parseFloat(ctx.params.id);
                    _context.next = 3;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentType.remove({ _id: id }), ctx.app.db.EquipmentItem.remove({ type: id }), ctx.app.db.EquipmentLog.remove({ type: id }), ctx.app.db.collection("equipmentimages.files").remove({ _id: id }), ctx.app.db.collection("equipmentimages.chunks").remove({ files_id: id })]));

                case 3:
                    ctx.status = 200;

                case 4:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};