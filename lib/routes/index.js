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
	mount("/suppliers",require("./suppliers")),/*
	mount("/projects",require("./projects")),
	mount("/equipmentio",require("./equipmentio")),
	mount("/rentals",require("./rentals"))*/
	route.get("/barcode/:code/*",function*(code,text){
		var generator = new Barc();
		var buf = generator.code128(code,1200,240,text||"");
		this.set("Content-Type","image/png");
		this.body = buf;
	})
]);
/*
this.app.post("/api/projects",ensurePermission("projects_read"),bp.json(),require("./routes/projects/find.js"));
this.app.post("/api/projects/create",ensurePermission("projects_write"),bp.json(),require("./routes/projects/create.js"));
this.app.get("/api/projects/:id",ensurePermission("projects_read"),require("./routes/projects/get.js"));
this.app.post("/api/projects/:id",ensurePermission("projects_write"),bp.json(),require("./routes/projects/update.js"));
this.app.get("/api/projects/:id/finish",ensurePermission("projects_write"),require("./routes/projects/finish.js"));
this.app.get("/api/projects/:id/delete",ensurePermission("projects_write"),require("./routes/projects/delete.js"));
this.app.get("/api/projects/:project/reservations/create",ensurePermission("projects_write"),require("./routes/projects/reservations/create.js"));
this.app.get("/api/projects/:project/reservations/:reservation",ensurePermission("projects_read"),require("./routes/projects/reservations/get.js"));
this.app.post("/api/projects/:project/reservations/:reservation",ensurePermission("projects_write"),bp.json(),require("./routes/projects/reservations/update.js"));
this.app.get("/api/projects/:project/reservations/:reservation/delete",ensurePermission("projects_write"),require("./routes/projects/reservations/delete.js"));
this.app.post("/api/equipmentio",ensurePermission("projects_write"),bp.json(),require("./routes/equipmentio/create.js"));
this.app.get("/api/equipmentio/:io/checkout",ensurePermission("projects_read"),require("./routes/equipmentio/checkout.js"));
this.app.get("/api/equipmentio/:io/checkin",ensurePermission("projects_read"),require("./routes/equipmentio/checkin.js"));
this.app.post("/api/equipmentio/:io",ensurePermission("projects_write"),bp.json(),require("./routes/equipmentio/update.js"));
this.app.get("/api/equipmentio/:io/finish",ensurePermission("projects_write"),require("./routes/equipmentio/finish.js"));
this.app.get("/api/equipmentio/:io/pickupConfirmation.docx",ensurePermission("projects_read"),require("./routes/equipmentio/pickupConfirmation.js"));
this.app.get("/api/equipmentio/:io/delete",ensurePermission("projects_write"),require("./routes/equipmentio/delete.js"));
this.app.post("/api/rentals",ensurePermission("rentals_read"),bp.json(),require("./routes/rentals/find.js"));
this.app.get("/api/rentals/:rental",ensurePermission("rentals_read"),require("./routes/rentals/get.js"));
this.app.post("/api/rentals/:rental",ensurePermission("rentals_write"),bp.json(),require("./routes/rentals/update.js"));
this.app.post("/api/rentals/:rental/updatestatus",ensurePermission("rentals_write"),bp.json(),require("./routes/rentals/updatestatus.js"));
this.app.get("/api/rentals/:rental/delete",ensurePermission("rentals_write"),require("./routes/rentals/delete.js"));


this.app.get("/api/barcode/:code/*",function(req,res){
	var generator = new Barc();
	var buf = generator.code128(req.params.code,1200,240,req.params[0]||"");
	res.writeHead(200,"OK",{"Content-Type":"image/png"});
	res.end(buf);
})*/
