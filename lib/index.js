"use strict";

var fs = require("fs");
var crypto = require("crypto");
var path = require("path");
var semver = require("semver");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var fsp = require("fs-promise");
var co = require("co");
var koa = require("koa");
var compose = require("koa-compose");
var mount = require("koa-mount");
var route = require("koa-route");
var compress = require("koa-compress");
var serve = require("koa-static");
var send = require("koa-send");
var pug = require("pug");
var routes = require("./routes");
require("babel-polyfill");

var page = pug.compile(fs.readFileSync(path.resolve(__dirname, "../views/page.jade")));

var Boxify = module.exports = function Boxify(config) {
    var self = this;

    this.config = config;
    this.app = new koa();
    this.modules = {};
    this.moduleclients = [];
    this.permissions = {};
    this.db = null;

    this.app.app = this;
    this.app.use(function _callee(ctx, next) {
        return regeneratorRuntime.async(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return regeneratorRuntime.awrap(next());

                    case 3:
                        _context.next = 8;
                        break;

                    case 5:
                        _context.prev = 5;
                        _context.t0 = _context["catch"](0);

                        if (_context.t0.status) {
                            ctx.status = _context.t0.status;
                            ctx.message = _context.t0.message;
                        } else {
                            ctx.status = 500;
                            ctx.body = _context.t0.message + _context.t0.stack;
                        }

                    case 8:
                    case "end":
                        return _context.stop();
                }
            }
        }, null, this, [[0, 5]]);
    });
    this.app.use(compress());
    this.app.use(mount("/public", serve(path.resolve(__dirname, "../public"))));
    this.app.use(mount("/public/bootstrap", serve(path.resolve(__dirname, "../node_modules/bootstrap/dist"))));
    this.app.use(mount("/public/react-widgets", serve(path.resolve(__dirname, "../node_modules/react-widgets/dist"))));
    this.app.use(mount("/public/react-select", serve(path.resolve(__dirname, "../node_modules/react-select/dist"))));
    this.app.use(route.get("/main.js", function _callee2(ctx) {
        return regeneratorRuntime.async(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return regeneratorRuntime.awrap(send(ctx, "lib/main.js"));

                    case 2:
                    case "end":
                        return _context2.stop();
                }
            }
        }, null, this);
    }));

    this.app.use(function _callee3(ctx, next) {
        return regeneratorRuntime.async(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        ctx.app = self;
                        _context3.next = 3;
                        return regeneratorRuntime.awrap(next());

                    case 3:
                    case "end":
                        return _context3.stop();
                }
            }
        }, null, this);
    });

    this.app.use(mount("/api", require("./api")));

    this.addPermission("contacts_read", "Kontakte ansehen");
    this.addPermission("contacts_write", "Kontakte erfassen, ändern & löschen");
    this.addPermission("users_read", "Benutzer ansehen");
    this.addPermission("users_write", "Benutzer erfassen, ändern & löschen");
    this.addPermission("equipment_read", "Equipment ansehen");
    this.addPermission("equipment_write", "Equipment erfassen, ändern & löschen");
    this.addPermission("customers_read", "Kunden ansehen");
    this.addPermission("customers_write", "Kundern erfassen, ändern & löschen");
    this.addPermission("suppliers_read", "Zulieferer ansehen");
    this.addPermission("suppliers_write", "Zulieferer erfassen, ändern & löschen");
    this.addPermission("projects_read", "Projekte ansehen");
    this.addPermission("projects_write", "Projekte erfassen, ändern & löschen");
    this.addPermission("rentals_read", "Zumieten ansehen");
    this.addPermission("rentals_write", "Zumieten erfassen, ändern & löschen");

    for (var module in config.modules) {
        this.modules[module] = require(module + "/lib/server")(this, config.modules[module]);
        this.moduleclients.push(module);
        this.app.use(route.get("/modules/" + module + ".js", function _callee4(ctx) {
            return regeneratorRuntime.async(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return regeneratorRuntime.awrap(send(ctx, "build.js", { root: path.dirname(require.resolve(module + "/lib/build.js")) }));

                        case 2:
                        case "end":
                            return _context4.stop();
                    }
                }
            }, null, this);
        }));
    }

    for (var r in routes) {
        this.addRoute(r);
    }
};

Boxify.prototype.addRoute = function (path, componentPath) {
    var self = this;
    this.app.use(route.get(path, function _callee5(ctx) {
        return regeneratorRuntime.async(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        ctx.set("Content-Type", "text/html");
                        ctx.body = page({ modules: self.moduleclients });

                    case 2:
                    case "end":
                        return _context5.stop();
                }
            }
        }, null, this);
    }));
};

Boxify.prototype.addPermission = function (id, name) {
    this.permissions[id] = name;
};

Boxify.prototype.start = function _callee6() {
    var con, db, module;
    return regeneratorRuntime.async(function _callee6$(_context6) {
        while (1) {
            switch (_context6.prev = _context6.next) {
                case 0:
                    con = mongoose.connect("mongodb://" + this.config.dbpath + "/boxify");
                    db = con.connection;
                    _context6.next = 4;
                    return regeneratorRuntime.awrap(con);

                case 4:
                    require("./models")(db);
                    this.db = db;
                    this.app.db = db;

                    _context6.next = 9;
                    return regeneratorRuntime.awrap(this.update());

                case 9:
                    _context6.t0 = regeneratorRuntime.keys(this.modules);

                case 10:
                    if ((_context6.t1 = _context6.t0()).done) {
                        _context6.next = 16;
                        break;
                    }

                    module = _context6.t1.value;
                    _context6.next = 14;
                    return regeneratorRuntime.awrap(this.modules[module].start());

                case 14:
                    _context6.next = 10;
                    break;

                case 16:

                    this.app.listen(this.config.port || 80);

                case 17:
                case "end":
                    return _context6.stop();
            }
        }
    }, null, this);
};

Boxify.prototype.update = function _callee7(cb) {
    var patches, settings, lastversion, version, module;
    return regeneratorRuntime.async(function _callee7$(_context7) {
        while (1) {
            switch (_context7.prev = _context7.next) {
                case 0:
                    _context7.next = 2;
                    return regeneratorRuntime.awrap(fsp.readdir(path.resolve(__dirname, "./patches")));

                case 2:
                    patches = _context7.sent;
                    _context7.next = 5;
                    return regeneratorRuntime.awrap(this.db.MainSettings.findOne({ _id: "main" }));

                case 5:
                    settings = _context7.sent;

                    if (settings) {
                        _context7.next = 10;
                        break;
                    }

                    settings = new this.db.MainSettings({ _id: "main" });
                    _context7.next = 10;
                    return regeneratorRuntime.awrap(settings.save());

                case 10:
                    if (settings.version) {
                        _context7.next = 14;
                        break;
                    }

                    settings.version = "0.0.0";
                    _context7.next = 14;
                    return regeneratorRuntime.awrap(settings.save());

                case 14:
                    lastversion = "0.0.0";
                    _context7.t0 = regeneratorRuntime.keys(patches);

                case 16:
                    if ((_context7.t1 = _context7.t0()).done) {
                        _context7.next = 45;
                        break;
                    }

                    version = _context7.t1.value;

                    version = patches[version].replace(".js", "");

                    if (!semver.gte(settings.version, version)) {
                        _context7.next = 21;
                        break;
                    }

                    return _context7.abrupt("continue", 16);

                case 21:
                    _context7.t2 = regeneratorRuntime.keys(this.modules);

                case 22:
                    if ((_context7.t3 = _context7.t2()).done) {
                        _context7.next = 29;
                        break;
                    }

                    module = _context7.t3.value;

                    if (!this.modules[module].beforeUpdate) {
                        _context7.next = 27;
                        break;
                    }

                    _context7.next = 27;
                    return regeneratorRuntime.awrap(this.modules[module].beforeUpdate(version));

                case 27:
                    _context7.next = 22;
                    break;

                case 29:
                    console.log("applying patch for version", version);
                    _context7.next = 32;
                    return regeneratorRuntime.awrap(require("./patches/" + version).call(this));

                case 32:
                    _context7.t4 = regeneratorRuntime.keys(this.modules);

                case 33:
                    if ((_context7.t5 = _context7.t4()).done) {
                        _context7.next = 40;
                        break;
                    }

                    module = _context7.t5.value;

                    if (!this.modules[module].afterUpdate) {
                        _context7.next = 38;
                        break;
                    }

                    _context7.next = 38;
                    return regeneratorRuntime.awrap(this.modules[module].afterUpdate(version));

                case 38:
                    _context7.next = 33;
                    break;

                case 40:
                    settings.version = version;
                    _context7.next = 43;
                    return regeneratorRuntime.awrap(settings.save());

                case 43:
                    _context7.next = 16;
                    break;

                case 45:
                    console.log("boxify is now at version", version);

                case 46:
                case "end":
                    return _context7.stop();
            }
        }
    }, null, this);
};