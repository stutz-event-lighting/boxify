var express = require("express");
var http = require("http");
var fs = require("fs");
var browserify = require("browserify");
var jade2react = require("jade2react");
var path = require("path");
var mongo = require("mongodb");
var bp = require("body-parser");
var async = require("async");
var config = require("../config.js");
var ws = require("ws");
var net = require("net");
var byline = require("byline");
var deviceProxy = require("./electronic/server/proxy.js");
var Barc = require("barcode-generator");



function App(){
    var self = this;


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
    this.addRoute("/projects",require.resolve("./views/projects.jade"));
    this.addRoute("/projects/:id",require.resolve("./views/project.jade"));
    this.addRoute("/projects/:project/reservations/:reservation",require.resolve("./views/reservation.jade"));
    this.addRoute("/projects/:project/checkouts/:checkout/:reservation?",require.resolve("./views/checkout.jade"));
    this.addRoute("/terminal",require.resolve("./views/terminal.jade"));
    this.addRoute("/electronic",require.resolve("./views/electronic.jade"));

    //API routes
    this.app.post("/api/equipment",bp.json(),require("./routes/equipmentlist.js"));
    this.app.get("/api/equipment/categories",require("./routes/getequipmentcategories.js"));
    this.app.post("/api/equipment/categories/create",bp.json(),require("./routes/createequipmentcategory.js"));
    this.app.post("/api/equipment/cetegories/:id",bp.json(),require("./routes/updateequipmentcategory.js"));
    this.app.get("/api/equipment/categories/:id/delete",require("./routes/deleteequipmentcategory.js"));
    this.app.post("/api/equipment/create",bp.json(),require("./routes/createequipmenttype.js"));
    this.app.get("/api/equipment/:id",require("./routes/getequipmenttype.js"))
    this.app.post("/api/equipment/:id",bp.json({limit:"10mb"}),require("./routes/updateequipmenttype.js"));
    this.app.get("/api/equipment/:id/image",require("./routes/getequipmenttypeimage.js"));
    this.app.post("/api/equipment/:type/count",bp.json(),require("./routes/updateequipmenttypecount.js"));
    this.app.get("/api/equipment/:id/delete",require("./routes/deleteequipmenttype.js"));
    this.app.post("/api/equipment/:type/create",bp.json(),require("./routes/createequipmentitem.js"));
    this.app.get("/api/equipment/:type/:id",require("./routes/getequipmentitem.js"));
    this.app.post("/api/equipment/:type/:id",bp.json(),require("./routes/updateequipmentitem.js"));
    this.app.get("/api/equipment/:type/:id/delete",require("./routes/deleteequipmentitem.js"));
    this.app.get("/api/users",require("./routes/getusers.js"));
    this.app.post("/api/users/create",bp.json(),require("./routes/createuser.js"));
    this.app.get("/api/users/:id",require("./routes/getuser.js"));
    this.app.post("/api/users/:id/save",bp.json(),require("./routes/saveuser.js"));
    this.app.post("/api/customers",bp.json(),require("./routes/getcustomers.js"));
    this.app.post("/api/customers/create",bp.json(),require("./routes/createcustomer.js"));
    this.app.get("/api/customers/:id",require("./routes/getcustomer.js"));
    this.app.post("/api/customers/:id",bp.json(),require("./routes/updatecustomer.js"));
    this.app.get("/api/customers/:id/delete",require("./routes/deletecustomer.js"));
    this.app.post("/api/projects",bp.json(),require("./routes/getprojects.js"));
    this.app.post("/api/projects/create",bp.json(),require("./routes/createproject.js"));
    this.app.get("/api/projects/:id",require("./routes/getproject.js"));
    this.app.post("/api/projects/:id",bp.json(),require("./routes/updateproject.js"));
    this.app.get("/api/projects/:id/delete",require("./routes/deleteproject.js"));
    this.app.get("/api/projects/:project/reservations/create",require("./routes/createreservation.js"));
    this.app.get("/api/projects/:project/reservations/:reservation",require("./routes/getreservation.js"));
    this.app.post("/api/projects/:project/reservations/:reservation",bp.json(),require("./routes/updatereservation.js"));
    this.app.get("/api/projects/:project/reservations/:reservation/delete",require("./routes/deletereservation.js"));
    this.app.get("/api/projects/:project/checkouts/:checkout/:reservation?",require("./routes/getcheckout.js"));
    //this.app.post("/api/projects/:project/checkouts/:checkout/:reservation?",bp.json(),require("./routes/updatecheckout.js"));

    this.app.get("/api/barcode/:code/*",function(req,res){
        console.log(req.params)
        var generator = new Barc();
        var buf = generator.code128(req.params.code,300,60,req.params[0]||"");
        res.writeHead(200,"OK",{"Content-Type":"image/png"});
        res.end(buf);
    })

    this.wsserver = new ws.Server({server:this.server});
    this.wsserver.on("connection",function(c){
        switch(c.upgradeReq.url){
            case "/api/electronic":
                deviceProxy(c);
                break;
            default:
                c.close();
                break;
        }
    });
}

App.prototype.addRoute = function(path,componentPath){
    var self = this;
    this.app.get(path,function(req,res){
        console.log(res == self, res == self.app)
        res.render("page",{data:{routes:self.routes}});
    });
    this.routes.push({
        path:path,
        componentPath:componentPath.replace(/\\/g,"/")
    });
}

App.prototype.generateScript = function(){
    var self = this;
    var bundle = browserify();
    bundle.add(require.resolve("./app.js"));
    for(var i = 0; i < this.routes.length; i++){
        bundle.require(this.routes[i].componentPath);
    }
    bundle.transform(jade2react);
    bundle.bundle(function(err,build){
        if(err) console.log(err.stack)
        self.build = build;
        for(var i = 0; i < self.buildCallbacks.length; i++) self.buildCallbacks[i]();
    });
}

App.prototype.start = function(){
    var self = this;
    mongo.connect("mongodb://"+config.dbpath+"/boxify",function(err,db){
        if(err) return cb(err);
        self.db = db;
        self.app.db = db;
        self.server.listen(80);
        console.log("listening...");
    });
}

var app = new App();
app.start();
