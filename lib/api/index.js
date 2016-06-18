var compose = require("koa-compose");
var mount = require("koa-mount");
var route = require("koa-route");
var Barc = require("barcode-generator");

module.exports = compose([
	mount("/session",require("./sessions")),
	mount("/equipment",require("./equipment")),
	mount("/contacts",require("./contacts")),
	mount("/users",require("./users")),
	mount("/customers",require("./customers")),
	mount("/suppliers",require("./suppliers")),
	mount("/projects",require("./projects")),
	mount("/equipmentio",require("./equipmentio")),
	mount("/rentals",require("./rentals")),
	route.get("/barcode/:code/*",function*(code,text){
		var generator = new Barc();
		var buf = generator.code128(code,1200,240,text||"");
		this.set("Content-Type","image/png");
		this.body = buf;
	})
]);
