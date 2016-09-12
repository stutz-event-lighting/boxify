"use strict";

var compose = require("koa-compose");
var mount = require("koa-mount");
var route = require("koa-route");
var Barc = require("barcode-generator");

module.exports = compose([mount("/session", require("./sessions")), mount("/equipment", require("./equipment")), mount("/contacts", require("./contacts")), mount("/users", require("./users")), mount("/customers", require("./customers")), mount("/suppliers", require("./suppliers")), mount("/projects", require("./projects")), mount("/equipmentio", require("./equipmentio")), mount("/rentals", require("./rentals")), route.get("/barcode/:code/*", function _callee(ctx, code, text) {
	var generator, buf;
	return regeneratorRuntime.async(function _callee$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					generator = new Barc();
					buf = generator.code128(code, 1200, 240, text || "");

					ctx.set("Content-Type", "image/png");
					ctx.body = buf;

				case 4:
				case "end":
					return _context.stop();
			}
		}
	}, null, this);
})]);