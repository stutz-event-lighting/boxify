"use strict";

module.exports = function _callee() {
    var db, actions;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    db = this.db;
                    actions = [];
                    _context.next = 4;
                    return regeneratorRuntime.awrap(new Promise(function (success, fail) {
                        db.collection("settings").find({}).toArray(function (err, settings) {
                            for (var i = 0; i < settings.length; i++) {
                                var s = settings[i];
                                switch (s._id) {
                                    case "nextContactID":
                                        actions.push(db.MainSettings.update({ _id: "main" }, { $set: { "nextContactId": s.value } }));
                                        break;
                                    case "nextEquipmenttypeID":
                                        actions.push(db.MainSettings.update({ _id: "main" }, { $set: { "nextEquipmenttypeId": s.value } }));
                                        break;
                                }
                            }
                            db.collection("settings").remove({ _id: { $ne: "main" } }, success);
                        });
                    }));

                case 4:
                    _context.next = 6;
                    return regeneratorRuntime.awrap(actions);

                case 6:
                    _context.next = 8;
                    return regeneratorRuntime.awrap(new Promise(function (success) {
                        db.collection("contacts").update({}, { $unset: { pin: true }, $rename: { comment: "remark" } }, { multi: true }, success);
                    }));

                case 8:
                    _context.next = 10;
                    return regeneratorRuntime.awrap(new Promise(function (success) {
                        db.collection("projects").update({}, { $rename: { comment: "remark" } }, { multi: true }, success);
                    }));

                case 10:
                    _context.next = 12;
                    return regeneratorRuntime.awrap(new Promise(function (success) {
                        db.collection("equipment").update({}, { $rename: { comment: "remark" } }, { multi: true }, success);
                    }));

                case 12:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};