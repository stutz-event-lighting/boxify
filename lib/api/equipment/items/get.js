"use strict";

var util = require("../../../util");

module.exports = function _callee3(ctx) {
    var type, id, data, types, item, logs, location, container;
    return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    type = parseInt(ctx.params.type, 10);
                    id = parseInt(ctx.params.id, 10);
                    _context3.next = 4;
                    return regeneratorRuntime.awrap(Promise.all([ctx.app.db.EquipmentItem.findOne({ type: type, id: id }).select("id type remark contents"), ctx.app.db.EquipmentLog.find({ type: type, id: id }).sort({ time: -1 }), function _callee() {
                        var query, io, project;
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        query = { draft: { $ne: true } };

                                        query["items." + ctx.params.type + ".suppliers.own.ids"] = id;
                                        _context.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentIo.findOne(query).select("project time type").sort({ time: -1 }));

                                    case 4:
                                        io = _context.sent;

                                        if (!(io && io.type == "checkout")) {
                                            _context.next = 12;
                                            break;
                                        }

                                        _context.next = 8;
                                        return regeneratorRuntime.awrap(ctx.app.db.Project.findOne({ _id: io.project }).select("customer"));

                                    case 8:
                                        project = _context.sent;
                                        _context.next = 11;
                                        return regeneratorRuntime.awrap(ctx.app.db.Contact.findOne({ _id: project.customer }).select("firstname lastname"));

                                    case 11:
                                        return _context.abrupt("return", _context.sent);

                                    case 12:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx), function _callee2() {
                        var query;
                        return regeneratorRuntime.async(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        query = {};

                                        query["contents." + type + ".ids"] = id + "";
                                        _context2.next = 4;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentItem.findOne(query).select("id type"));

                                    case 4:
                                        return _context2.abrupt("return", _context2.sent);

                                    case 5:
                                    case "end":
                                        return _context2.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx)]));

                case 4:
                    data = _context3.sent;
                    types = Object.keys(data[0].contents).map(function (id) {
                        return parseFloat(id);
                    });

                    if (data[3] && types.indexOf(data[3].type) < 0) types.push(data[3].type);
                    if (types.indexOf(data[0].type) < 0) types.push(data[0].type);

                    item = JSON.parse(JSON.stringify(data[0]));
                    logs = data[1];
                    location = data[2];
                    container = data[3];
                    _context3.next = 14;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.find({ _id: { $in: types } }).select("name"));

                case 14:
                    types = _context3.sent;

                    types = util.createIndex(types, "_id");
                    item.name = types[item.type].name;
                    for (type in item.contents) {
                        item.contents[type].name = types[type].name;
                    }
                    if (container) container.name = types[container.type].name;

                    ctx.set("Content-Type", "application/json");
                    ctx.body = JSON.stringify({ item: item, logs: logs, location: location, container: container });

                case 21:
                case "end":
                    return _context3.stop();
            }
        }
    }, null, this);
};