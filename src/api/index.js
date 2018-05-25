var compose = require("koa-compose");
var mount = require("koa-mount");
var route = require("koa-route");
var {barcode} = require("pure-svg-code");

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
	mount("/documents",require("./documents")),
	mount("/offers",require("./offers")),
	route.get("/barcode/:code/*",async function(ctx,code,text){
		ctx.set("Content-Type","image/svg+xml");
		var width = 100;
		var ratio = 1.5;
		var size = Math.min(7,(width*ratio)/text.length);
		ctx.body = barcode(code,"code128").replace("</svg>",'<rect x="5" y="40" width="90" height="10" fill="white"/><text x="50" y="47" text-anchor="middle" font-family="monospace" font-size="'+size+'px">'+text+'</text></svg>');
	})
]);
