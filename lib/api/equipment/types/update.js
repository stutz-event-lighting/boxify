"use strict";

var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function _callee3(ctx) {
    var body, id, results, old, before, after, create, del;
    return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return regeneratorRuntime.awrap(parse.json(ctx, { limit: "10mb" }));

                case 2:
                    body = _context3.sent;
                    id = parseInt(ctx.params.id, 10);
                    _context3.next = 6;
                    return regeneratorRuntime.awrap(Promise.all([function _callee() {
                        var query;
                        return regeneratorRuntime.async(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        query = { $set: {
                                                name: body.name
                                            }, $unset: {} };

                                        if (body.manufacturer) {
                                            query.$set.manufacturer = body.manufacturer;
                                        } else {
                                            query.$unset.manufacturer = 1;
                                        }
                                        if (body.manufacturerArticlenumber) {
                                            query.$set.manufacturerArticlenumber = body.manufacturerArticlenumber;
                                        } else {
                                            query.$unset.manufacturerArticlenumber = 1;
                                        }
                                        if (body.manufacturerEAN) {
                                            query.$set.manufacturerEAN = body.manufacturerEAN;
                                        } else {
                                            query.$unset.manufacturerEAN = 1;
                                        }
                                        if (body.technicalDescription) {
                                            query.$set.technicalDescription = body.technicalDescription;
                                        } else {
                                            query.$unset.technicalDescription = 1;
                                        }
                                        if (body.weight === undefined) {
                                            query.$unset.weight = 1;
                                        } else {
                                            query.$set.weight = body.weight;
                                        }
                                        if (body.length === undefined) {
                                            query.$unset.length = 1;
                                        } else {
                                            query.$set.length = body.length;
                                        }
                                        if (body.width === undefined) {
                                            query.$unset.width = 1;
                                        } else {
                                            query.$set.width = body.width;
                                        }
                                        if (body.height === undefined) {
                                            query.$unset.height = 1;
                                        } else {
                                            query.$set.height = body.height;
                                        }
                                        if (body.rent === undefined) {
                                            query.$unset.rent = 1;
                                        } else {
                                            query.$set.rent = body.rent;
                                        }
                                        if (body.factoryPrice === undefined) {
                                            query.$unset.factoryPrice = 1;
                                        } else {
                                            query.$set.factoryPrice = body.factoryPrice;
                                        }
                                        if (body.category == undefined) {
                                            query.$unset.category = 1;
                                        } else {
                                            query.$set.category = mongo.ObjectID(body.category);
                                        }
                                        if (body.tags == undefined) {
                                            query.$unset.tags = 1;
                                        } else {
                                            query.$set.tags = body.tags;
                                        }

                                        if (body.contents !== undefined) {
                                            query.$set.contents = body.contents;
                                        } else {
                                            query.$unset.contents = 1;
                                        }

                                        if (!Object.keys(query.$unset).length) delete query.$unset;

                                        _context.next = 17;
                                        return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.findOneAndUpdate({ _id: id }, query));

                                    case 17:
                                        return _context.abrupt("return", _context.sent);

                                    case 18:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx), function _callee2() {
                        var parts, mime, data, store;
                        return regeneratorRuntime.async(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        if (body.image) {
                                            _context2.next = 2;
                                            break;
                                        }

                                        return _context2.abrupt("return");

                                    case 2:
                                        parts = body.image.split(",");
                                        mime = parts[0].substring(5, parts[0].length - 7);
                                        data = new Buffer(parts[1], "base64");
                                        store = new mongo.GridStore(ctx.app.db.db, parseFloat(ctx.params.id), parseFloat(ctx.params.id), "w", { root: "equipmentimages", content_type: mime });
                                        _context2.next = 8;
                                        return regeneratorRuntime.awrap(store.open());

                                    case 8:
                                        _context2.next = 10;
                                        return regeneratorRuntime.awrap(store.write(data, true));

                                    case 10:
                                    case "end":
                                        return _context2.stop();
                                }
                            }
                        }, null, this);
                    }.call(ctx)]));

                case 6:
                    results = _context3.sent;
                    old = results[0];
                    before = old.tags || [];
                    after = body.tags || [];
                    create = after.filter(function (tag) {
                        return before.indexOf(tag) < 0;
                    });
                    del = before.filter(function (tag) {
                        return after.indexOf(tag) < 0;
                    });
                    _context3.next = 14;
                    return regeneratorRuntime.awrap(Promise.all([createTags(ctx.app.db, create), deleteTags(ctx.app.db, del)]));

                case 14:

                    ctx.status = 200;

                case 15:
                case "end":
                    return _context3.stop();
            }
        }
    }, null, this);
};

function createTags(db, tags) {
    return regeneratorRuntime.async(function createTags$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    _context4.next = 2;
                    return regeneratorRuntime.awrap(Promise.all(tags.map(function (tag) {
                        return db.EquipmentTag.update({ _id: tag }, { $set: { _id: tag } }, { upsert: true });
                    })));

                case 2:
                case "end":
                    return _context4.stop();
            }
        }
    }, null, this);
}

function deleteTags(db, tags) {
    return regeneratorRuntime.async(function deleteTags$(_context6) {
        while (1) {
            switch (_context6.prev = _context6.next) {
                case 0:
                    _context6.next = 2;
                    return regeneratorRuntime.awrap(Promise.all(tags.map(function _callee4(tag) {
                        return regeneratorRuntime.async(function _callee4$(_context5) {
                            while (1) {
                                switch (_context5.prev = _context5.next) {
                                    case 0:
                                        _context5.next = 2;
                                        return regeneratorRuntime.awrap(db.EquipmentType.findOne({ tags: tag }));

                                    case 2:
                                        if (_context5.sent) {
                                            _context5.next = 5;
                                            break;
                                        }

                                        _context5.next = 5;
                                        return regeneratorRuntime.awrap(db.EquipmentTag.remove({ _id: tag }));

                                    case 5:
                                    case "end":
                                        return _context5.stop();
                                }
                            }
                        }, null, this);
                    })));

                case 2:
                case "end":
                    return _context6.stop();
            }
        }
    }, null, this);
}