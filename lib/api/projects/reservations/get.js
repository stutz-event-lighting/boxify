"use strict";

var mongo = require("mongodb");
var util = require("../../../util");
module.exports = function _callee(ctx) {
    var results;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentReservation.findOne({ _id: mongo.ObjectID(ctx.params.reservation) }).select("items"), ctx.app.db.EquipmentType.find({}).select("name category"), ctx.app.db.EquipmentCategory.find({}).select("name")]));

                case 2:
                    results = _context.sent;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify({
                        reservation: results[0],
                        types: util.createIndex(results[1], "_id"),
                        categories: util.createIndex(results[2], "_id")
                    });

                case 5:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};