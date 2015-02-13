var express = require("express");
var fs = require("fs");
var browserify = require("browserify");
var jade2react = require("jade2react");
var path = require("path");
var mongo = require("mongodb");
var bp = require("body-parser");
var async = require("async");
var config = require("../config.js");



function App(){
    var self = this;
    this.app = express();
    this.buildCallbacks = [];
    this.routes = [];
    this.build = null;
    this.db = null;

    this.app.set("view engine","jade");
    this.app.app = this;

    this.app.use("/public",express.static(path.resolve(__dirname,"../public")));
    this.app.use(function(req,res,next){
        res.fail = function(code,message){
            if(code instanceof Error){
                res.writeHead(600,"Unexpected error");
            }else{
                res.writeHead(code||600,message);
            }
            res.end();
        }

        if(self.build){
            next();
        }else{
            self.buildCallbacks.push(next);
            self.generateScript();
        }
    });
    this.app.get("/main.js",function(req,res){
        res.writeHead(200,{"Content-Type":"text/javascript"});
        res.end(self.build+"");
    });

    //UI routes
    this.addRoute("/",require.resolve("./views/main.jade"));
    this.addRoute("/equipment",require.resolve("./views/equipment.jade"));
    this.addRoute("/equipment/:type",require.resolve("./views/equipmenttype.jade"));
    this.addRoute("/equipment/:type/:id",require.resolve("./views/equipmentitem.jade"));
    this.addRoute("/users",require.resolve("./views/users.jade"));
    this.addRoute("/users/:id",require.resolve("./views/user.jade"));
    this.addRoute("/terminal",require.resolve("./views/terminal.jade"));

    //API routes
    this.app.post("/api/equipment",bp.json(),require("./routes/equipmentlist.js"));
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
        for(var i = 0; i < self.buildCallbacks.length; i++) self.buildCallbacks[i]();
        self.build = build;
    });
}

App.prototype.start = function(){
    var self = this;
    mongo.connect("mongodb://"+config.dbpath+"/boxify",function(err,db){
        if(err) return cb(err);
        self.db = db;
        self.app.db = db;
        self.app.listen(80);
        console.log("listening...");
    });
}

var app = new App();
app.start();
