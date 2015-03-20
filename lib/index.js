var express = require("express");
var http = require("http");
var fs = require("fs");
var browserify = require("browserify");
var jade2react = require("jade2react");
var path = require("path");
var mongo = require("mongodb");
var bp = require("body-parser");
var async = require("async");
var Barc = require("barcode-generator");



var Boxify = module.exports = function Boxify(config){
    var self = this;

    this.config = config;
    this.app = express();
    this.server = http.createServer(this.app);
    this.buildCallbacks = [];
    this.routes = [];
    this.build = null;
    this.db = null;

    this.app.set("view engine","jade");
    this.app.app = this;

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
            self.generateScript();
            console.log("waiting");
        }
        function sendBuild(){
            console.log("sending");
            res.writeHead(200,{"Content-Type":"text/javascript"});
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
    this.addRoute("/users/:id",require.resolve("./views/user.jade"));
    this.addRoute("/customers",require.resolve("./views/customers.jade"));
    this.addRoute("/customers/:id",require.resolve("./views/customer.jade"));
    this.addRoute("/suppliers",require.resolve("./views/suppliers.jade"));
    this.addRoute("/suppliers/:id",require.resolve("./views/supplier.jade"));
    this.addRoute("/projects",require.resolve("./views/projects.jade"));
    this.addRoute("/projects/:id",require.resolve("./views/project.jade"));
    this.addRoute("/projects/:project/reservations/:reservation",require.resolve("./views/reservation.jade"));
    this.addRoute("/projects/:project/checkouts/:checkout/:reservation?",require.resolve("./views/checkout.jade"));
    this.addRoute("/rentals",require.resolve("./views/rentals.jade"));
    this.addRoute("/rentals/:rental",require.resolve("./views/rental.jade"));
    this.addRoute("/terminal",require.resolve("./views/terminal.jade"));

    //API routes
    this.app.get("/api/equipment/categories",require("./routes/equipment/categories/find.js"));
    this.app.post("/api/equipment/categories/create",bp.json(),require("./routes/equipment/categories/create.js"));
    this.app.post("/api/equipment/cetegories/:id",bp.json(),require("./routes/equipment/categories/update.js"));
    this.app.get("/api/equipment/categories/:id/delete",require("./routes/equipment/categories/delete.js"));
    this.app.post("/api/equipment",bp.json(),require("./routes/equipment/types/find.js"));
    this.app.post("/api/equipment/create",bp.json(),require("./routes/equipment/types/create.js"));
    this.app.get("/api/equipment/:id",require("./routes/equipment/types/get.js"))
    this.app.post("/api/equipment/:id",bp.json({limit:"10mb"}),require("./routes/equipment/types/update.js"));
    this.app.get("/api/equipment/:id/image",require("./routes/equipment/types/image.js"));
    this.app.post("/api/equipment/:type/count",bp.json(),require("./routes/equipment/types/updatecount.js"));
    this.app.get("/api/equipment/:id/delete",require("./routes/equipment/types/delete.js"));
    this.app.post("/api/equipment/:type/create",bp.json(),require("./routes/equipment/items/create.js"));
    this.app.get("/api/equipment/:type/:id",require("./routes/equipment/items/get.js"));
    this.app.post("/api/equipment/:type/:id",bp.json(),require("./routes/equipment/items/update.js"));
    this.app.get("/api/equipment/:type/:id/delete",require("./routes/equipment/items/delete.js"));
    this.app.get("/api/users",require("./routes/users/find.js"));
    this.app.post("/api/users/create",bp.json(),require("./routes/users/create.js"));
    this.app.get("/api/users/:id",require("./routes/users/get.js"));
    this.app.post("/api/users/:id/save",bp.json(),require("./routes/users/update.js"));
    this.app.post("/api/customers",bp.json(),require("./routes/customers/find.js"));
    this.app.post("/api/customers/create",bp.json(),require("./routes/customers/create.js"));
    this.app.get("/api/customers/:id",require("./routes/customers/get.js"));
    this.app.post("/api/customers/:id",bp.json(),require("./routes/customers/update.js"));
    this.app.get("/api/customers/:id/delete",require("./routes/customers/delete.js"));
    this.app.post("/api/suppliers",bp.json(),require("./routes/suppliers/find.js"));
    this.app.post("/api/suppliers/create",bp.json(),require("./routes/suppliers/create.js"));
    this.app.get("/api/suppliers/:id",require("./routes/suppliers/get.js"));
    this.app.post("/api/suppliers/:id",bp.json(),require("./routes/suppliers/update.js"));
    this.app.get("/api/suppliers/:id/delete",require("./routes/suppliers/delete.js"));
    this.app.post("/api/projects",bp.json(),require("./routes/projects/find.js"));
    this.app.post("/api/projects/create",bp.json(),require("./routes/projects/create.js"));
    this.app.get("/api/projects/:id",require("./routes/projects/get.js"));
    this.app.post("/api/projects/:id",bp.json(),require("./routes/projects/update.js"));
    this.app.get("/api/projects/:id/delete",require("./routes/projects/delete.js"));
    this.app.get("/api/projects/:project/reservations/create",require("./routes/projects/reservations/create.js"));
    this.app.get("/api/projects/:project/reservations/:reservation",require("./routes/projects/reservations/get.js"));
    this.app.post("/api/projects/:project/reservations/:reservation",bp.json(),require("./routes/projects/reservations/update.js"));
    this.app.get("/api/projects/:project/reservations/:reservation/delete",require("./routes/projects/reservations/delete.js"));
    this.app.get("/api/projects/:project/checkouts/:checkout/:reservation?",require("./routes/projects/checkouts/get.js"));
    //this.app.post("/api/projects/:project/checkouts/:checkout/:reservation?",bp.json(),require("./routes/updatecheckout.js"));
    this.app.post("/api/rentals",bp.json(),require("./routes/rentals/find.js"));
    this.app.get("/api/rentals/:rental",require("./routes/rentals/get.js"));
    this.app.post("/api/rentals/:rental",bp.json(),require("./routes/rentals/update.js"));
    this.app.post("/api/rentals/:rental/updatestatus",bp.json(),require("./routes/rentals/updatestatus.js"));
    this.app.get("/api/rentals/:rental/delete",require("./routes/rentals/delete.js"));


    this.app.get("/api/barcode/:code/*",function(req,res){
        console.log(req.params)
        var generator = new Barc();
        var buf = generator.code128(req.params.code,300,60,req.params[0]||"");
        res.writeHead(200,"OK",{"Content-Type":"image/png"});
        res.end(buf);
    })

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
        for(var i = 0; i < self.buildCallbacks.length; i++) self.buildCallbacks[i]();
    });
}

Boxify.prototype.start = function(){
    var self = this;
    mongo.connect("mongodb://"+this.config.dbpath+"/boxify",function(err,db){
        if(err) return cb(err);
        self.db = db;
        self.app.db = db;
        self.server.listen(80);
        console.log("listening...");
    });
}
