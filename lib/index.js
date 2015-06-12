var express = require("express");
var http = require("http");
var fs = require("fs");
var crypto = require("crypto");
var compression = require("compression");
var browserify = require("browserify");
var jade2react = require("jade2react");
var path = require("path");
var mongo = require("mongodb");
var bp = require("body-parser");
var async = require("async");
var semver = require("semver");
var Barc = require("barcode-generator");

var ensurePermission = require("./routes/sessions/ensure_mw.js");
var getSession = require("./routes/sessions/get_mw.js");



var Boxify = module.exports = function Boxify(config){
    var self = this;

    this.config = config;
    this.app = express();
    this.server = http.createServer(this.app);
    this.buildCallbacks = [];
    this.routes = [];
    this.permissions = {};
    this.build = null;
    this.buildetag = null;
    this.db = null;

    this.app.set("view engine","jade");
    this.app.app = this;
    this.app.use(compression());
    this.app.use("/public",express.static(path.resolve(__dirname,"../public")));
    this.app.use("/public/react-select",express.static(path.resolve(__dirname,"../node_modules/react-select/dist")));
    this.app.use("/public/react-widgets",express.static(path.resolve(__dirname,"../node_modules/react-widgets/dist")));
    this.app.use(function(req,res,next){
        res.fail = function(code,message){
            if(code instanceof Error){
                res.writeHead(600,"Unexpected error");
            }else{
                res.writeHead(code||600,message);
            }
            res.end();
        }
        next();
    });
    this.app.get("/main.js",function(req,res){
        if(self.build){
            sendBuild();
        }else{
            self.buildCallbacks.push(sendBuild);
            if(self.buildCallbacks.length == 1) self.generateScript();
            console.log("waiting");
        }
        function sendBuild(){
            console.log("sending");
            if(req.headers["if-none-match"] === self.buildetag){
                res.writeHead(304,"Not modified");
                res.end();
                return;
            }
            res.writeHead(200,{"Content-Type":"text/javascript","ETag":self.buildetag,"Cache-Control":"public, max-age=0"});
            res.end(self.build+"");
        }
    });

    //UI routes
    this.addRoute("/",require.resolve("./views/main.jade"));
    this.addRoute("/equipment",require.resolve("./views/equipment.jade"));
    this.addRoute("/equipment/categories",require.resolve("./views/equipmentcategories.jade"));
    this.addRoute("/equipment/:type",require.resolve("./views/equipmenttype.jade"));
    this.addRoute("/equipment/:type/:id",require.resolve("./views/equipmentitem.jade"));
    this.addRoute("/users",require.resolve("./views/users.jade"));
    this.addRoute("/users/:user",require.resolve("./views/user.jade"));
    this.addRoute("/customers",require.resolve("./views/customers.jade"));
    this.addRoute("/customers/:id",require.resolve("./views/customer.jade"));
    this.addRoute("/suppliers",require.resolve("./views/suppliers.jade"));
    this.addRoute("/suppliers/:id",require.resolve("./views/supplier.jade"));
    this.addRoute("/projects",require.resolve("./views/projects.jade"));
    this.addRoute("/projects/:id",require.resolve("./views/project.jade"));
    this.addRoute("/projects/:project/reservations/:reservation",require.resolve("./views/reservation.jade"));
    this.addRoute("/projects/:project/checkouts/:checkout",require.resolve("./views/checkout.jade"));
    this.addRoute("/projects/:project/checkins/:checkin",require.resolve("./views/checkin.jade"));
    this.addRoute("/rentals",require.resolve("./views/rentals.jade"));
    this.addRoute("/rentals/:rental",require.resolve("./views/rental.jade"));
    this.addRoute("/profile",require.resolve("./views/profile.jade"));

    //API routes
    this.app.post("/api/session/create",bp.json(),require("./routes/sessions/create.js"));
    this.app.get("/api/session",require("./routes/sessions/get_api.js"));
    this.app.get("/api/session/delete",require("./routes/sessions/delete.js"));
    this.app.get("/api/equipment/categories",ensurePermission("equipment_read"),require("./routes/equipment/categories/find.js"));
    this.app.post("/api/equipment/categories/create",ensurePermission("equipment_write"),bp.json(),require("./routes/equipment/categories/create.js"));
    this.app.post("/api/equipment/cetegories/:id",ensurePermission("equipment_write"),bp.json(),require("./routes/equipment/categories/update.js"));
    this.app.get("/api/equipment/categories/:id/delete",ensurePermission("equipment_write"),require("./routes/equipment/categories/delete.js"));
    this.app.post("/api/equipment",ensurePermission("equipment_read"),bp.json(),require("./routes/equipment/types/find.js"));
    this.app.post("/api/equipment/create",ensurePermission("equipment_write"),bp.json(),require("./routes/equipment/types/create.js"));
    this.app.get("/api/equipment/:id",ensurePermission("equipment_read"),require("./routes/equipment/types/get.js"))
    this.app.post("/api/equipment/:id",ensurePermission("equipment_write"),bp.json({limit:"10mb"}),require("./routes/equipment/types/update.js"));
    this.app.get("/api/equipment/:id/image",ensurePermission("equipment_read"),require("./routes/equipment/types/image.js"));
    this.app.get("/api/equipment/:type/name",ensurePermission("equipment_read"),require("./routes/equipment/types/getname.js"));
    this.app.post("/api/equipment/:type/count",ensurePermission("equipment_write"),bp.json(),require("./routes/equipment/types/updatecount.js"));
    this.app.get("/api/equipment/:type/stock",ensurePermission("equipment_read"),require("./routes/equipment/types/stock.js"));
    this.app.get("/api/equipment/:type/graph/:from-:to",ensurePermission("equipment_read"),require("./routes/equipment/types/graph.js"));
    this.app.get("/api/equipment/:id/delete",ensurePermission("equipment_write"),require("./routes/equipment/types/delete.js"));
    this.app.post("/api/equipment/:type/create",ensurePermission("equipment_write"),bp.json(),require("./routes/equipment/items/create.js"));
    this.app.get("/api/equipment/:type/:id",ensurePermission("equipment_read"),require("./routes/equipment/items/get.js"));
    this.app.post("/api/equipment/:type/:id",ensurePermission("equipment_write"),bp.json(),require("./routes/equipment/items/update.js"));
    this.app.get("/api/equipment/:type/:item/container",ensurePermission("equipment_read"),require("./routes/equipment/items/container.js"));
    this.app.get("/api/equipment/:type/:id/delete",ensurePermission("equipment_write"),require("./routes/equipment/items/delete.js"));
    this.app.get("/api/users",ensurePermission("users_read"),require("./routes/users/find.js"));
    this.app.post("/api/users/create",ensurePermission("users_write"),bp.json(),require("./routes/users/create.js"));
    this.app.get("/api/users/:id",getSession,require("./routes/users/get.js"));
    this.app.get("/api/users/:id/image",getSession,require("./routes/users/image.js"));
    this.app.post("/api/users/:id/save",getSession,bp.json({limit:"10mb"}),require("./routes/users/update.js"));
    this.app.post("/api/users/:user/pin",getSession,bp.json(),require("./routes/users/setpin.js"));
    this.app.post("/api/users/:user/password",getSession,bp.json(),require("./routes/users/setpassword.js"));
    this.app.get("/api/users/:user/delete",getSession,require("./routes/users/delete.js"));
    this.app.post("/api/customers",ensurePermission("customers_read"),bp.json(),require("./routes/customers/find.js"));
    this.app.post("/api/customers/create",ensurePermission("customers_write"),bp.json(),require("./routes/customers/create.js"));
    this.app.get("/api/customers/:id",ensurePermission("customers_read"),require("./routes/customers/get.js"));
    this.app.post("/api/customers/:id",ensurePermission("customers_write"),bp.json(),require("./routes/customers/update.js"));
    this.app.get("/api/customers/:id/delete",ensurePermission("customers_write"),require("./routes/customers/delete.js"));
    this.app.post("/api/suppliers",ensurePermission("suppliers_read"),bp.json(),require("./routes/suppliers/find.js"));
    this.app.post("/api/suppliers/create",ensurePermission("suppliers_write"),bp.json(),require("./routes/suppliers/create.js"));
    this.app.get("/api/suppliers/:id",ensurePermission("suppliers_read"),require("./routes/suppliers/get.js"));
    this.app.post("/api/suppliers/:id",ensurePermission("suppliers_write"),bp.json(),require("./routes/suppliers/update.js"));
    this.app.get("/api/suppliers/:id/image",ensurePermission("suppliers_read"),require("./routes/suppliers/image.js"));
    this.app.get("/api/suppliers/:id/delete",ensurePermission("suppliers_write"),require("./routes/suppliers/delete.js"));
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
    this.app.get("/api/projects/:project/checkouts/:checkout",ensurePermission("projects_read"),require("./routes/projects/checkouts/get.js"));
    this.app.post("/api/projects/:project/checkouts/:checkout",ensurePermission("projects_write"),bp.json(),require("./routes/projects/checkouts/update.js"));
    this.app.get("/api/projects/:project/checkouts/:checkout/delete",ensurePermission("projects_write"),require("./routes/projects/checkouts/delete.js"));
    this.app.get("/api/projects/:project/checkins/:checkin",ensurePermission("projects_read"),require("./routes/projects/checkins/get.js"));
    this.app.post("/api/projects/:project/checkins/:checkin",ensurePermission("projects_write"),bp.json(),require("./routes/projects/checkins/update.js"));
    //this.app.get("/api/projects/:project/checkins/:checkin/delete",require("./routes/projects/checkins/delete.js"));
    this.app.post("/api/rentals",ensurePermission("rentals_read"),bp.json(),require("./routes/rentals/find.js"));
    this.app.get("/api/rentals/:rental",ensurePermission("rentals_read"),require("./routes/rentals/get.js"));
    this.app.post("/api/rentals/:rental",ensurePermission("rentals_write"),bp.json(),require("./routes/rentals/update.js"));
    this.app.post("/api/rentals/:rental/updatestatus",ensurePermission("rentals_write"),bp.json(),require("./routes/rentals/updatestatus.js"));
    this.app.get("/api/rentals/:rental/delete",ensurePermission("rentals_write"),require("./routes/rentals/delete.js"));


    this.app.get("/api/barcode/:code/*",function(req,res){
        console.log(req.params)
        var generator = new Barc();
        var buf = generator.code128(req.params.code,1200,240,req.params[0]||"");
        res.writeHead(200,"OK",{"Content-Type":"image/png"});
        res.end(buf);
    })
    this.addPermission("users_read","Benutzer ansehen");
    this.addPermission("users_write","Benutzer verändern (inkl. Rechte!)");
    this.addPermission("equipment_read","Equipment ansehen");
    this.addPermission("equipment_write","Equipment erfassen, ändern & löschen");
    this.addPermission("customers_read","Kunden ansehen");
    this.addPermission("customers_write","Kundern erfassen, ändern & löschen");
    this.addPermission("suppliers_read","Zulieferer ansehen");
    this.addPermission("suppliers_write","Zulieferer erfassen, ändern & löschen");
    this.addPermission("projects_read","Projekte ansehen");
    this.addPermission("projects_write","Projekte erfassen, ändern & löschen");
    this.addPermission("rentals_read","Zumieten ansehen");
    this.addPermission("rentals_write","Zumieten erfassen, ändern & löschen");


    for(var module in config.modules){
        require(module)(this,config.modules[module]);
    }
}

Boxify.prototype.addRoute = function(path,componentPath){
    var self = this;
    this.app.get(path,function(req,res){
        res.render("page",{data:{routes:self.routes}});
    });
    this.routes.push({
        path:path,
        componentPath:componentPath.replace(/\\/g,"/")
    });
}

Boxify.prototype.addPermission = function(id,name){
    this.permissions[id] = name;
}

Boxify.prototype.generateScript = function(){
    var self = this;
    var bundle = browserify();
    bundle.transform(jade2react,{global:true});
    bundle.add(require.resolve("./app.js"));
    for(var i = 0; i < this.routes.length; i++){
        bundle.require(this.routes[i].componentPath);
    }
    bundle.bundle(function(err,build){
        if(err) throw err;
        self.build = build;
        self.buildetag = 'W/"'+crypto.createHash("md5").update(build).digest("hex")+'"';
        for(var i = 0; i < self.buildCallbacks.length; i++) self.buildCallbacks[i]();
    });
}

Boxify.prototype.start = function(){
    var self = this;
    mongo.connect("mongodb://"+this.config.dbpath+"/boxify",function(err,db){
        if(err) throw err;
        self.db = db;
        self.app.db = db;

        self.update(function(){
            self.server.listen(80);
            console.log("listening...");
        });
    });
}

Boxify.prototype.update = function(cb){
    var self = this;
    var patches = {
        "0.1.2":function(cb){
            self.db.collection("equipment").find({}).toArray(function(err,items){
                async.eachSeries(items,function(item,cb){
                    self.db.collection("equipmenttypes").update({_id:item.type},{$set:{hasItems:true}},cb);
                },cb);
            });
        },
        "0.1.3":function(cb){
            self.db.collection("equipmentio").update({},{$set:{user:mongo.ObjectID("55434b620f5bc18214c41706")}},{multi:true},cb);
        },
        "0.1.4":function(cb){
            self.db.collection("projects").update({},{$set:{status:"ongoing"}},{multi:true},cb)
        }
    };
    this.db.collection("settings").findOne({_id:"version"},{version:true},function(err,setting){
        if(err) return cb(err);
        if(!setting) setting = {_id:"version",version:"0.0.0"};
        var lastversion = "0.0.0";
        async.eachSeries(Object.keys(patches),function(version,cb){
            lastversion = version;
            if(semver.gte(setting.version,version)) return cb();
            console.log("applying patch for version",version);
            patches[version](cb);
        },function(err){
            if(err) throw err;
            console.log("applied all patches");
            self.db.collection("settings").update({_id:"version"},{$set:{version:lastversion}},{upsert:true},cb);
        })
    })
}
