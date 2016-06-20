var http = require("http");
var fs = require("fs");
var crypto = require("crypto");
var path = require("path");
var async = require("async");
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

var page = pug.compile(fs.readFileSync(path.resolve(__dirname,"../views/page.jade")));

var Boxify = module.exports = function Boxify(config){
    var self = this;

    this.config = config;
    this.app = koa();
    this.server = http.createServer(this.app.callback());
    this.modules = {};
    this.permissions = {};
    this.db = null;

    this.app.app = this;
    this.app.use(function*(next){
        try{
            yield next;
        }catch(e){
            if(e.status){
                this.status = e.status;
                this.message = e.message;
            }else{
                this.status = 500;
                this.body = e.message+e.stack;
            }
        }
    })
    this.app.use(compress());
    this.app.use(mount("/public",serve(path.resolve(__dirname,"../public"))));
    this.app.use(route.get("/main.js",function*(){
        yield send(this,"lib/main.js");
    }));

    this.app.use(function*(next){
        this.app = self;
        yield next;
    });

    this.app.use(mount("/api",require("./api")));

    for(var r in routes){
        this.addRoute(r);
    }

    this.addPermission("contacts_read","Kontakte ansehen");
    this.addPermission("contacts_write","Kontakte erfassen, ändern & löschen");
    this.addPermission("users_read","Benutzer ansehen");
    this.addPermission("users_write","Benutzer erfassen, ändern & löschen");
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
        this.modules[module] = require(module)(this,config.modules[module]);
    }
}

Boxify.prototype.addRoute = function(path,componentPath){
    var self = this;
    this.app.use(route.get(path,function*(){
        this.set("Content-Type","text/html");
        this.body = page({data:{}});
    }));
}

Boxify.prototype.addPermission = function(id,name){
    this.permissions[id] = name;
}

Boxify.prototype.start = co.wrap(function*(){
    var con = mongoose.connect("mongodb://"+this.config.dbpath+"/boxify");
    var db = con.connection;
    yield con;
    require("./models")(db);
    this.db = db;
    this.app.db = db;

    yield this.update();

    for(var module in this.modules){
        yield this.modules[module].start();
    }

    this.server.listen(this.config.port||80);
})

Boxify.prototype.update = co.wrap(function*(cb){
    var patches = yield fsp.readdir(path.resolve(__dirname,"./patches"));
    var settings = yield this.db.MainSettings.findOne({_id:"main"});

    if(!settings){
        settings = new this.db.MainSettings({_id:"main"});
        yield settings.save();
    }

    if(!settings.version){
        settings.version = "0.0.0";
        yield settings.save();
    }
    var lastversion = "0.0.0";

    for(var version in patches){
        version = patches[version].replace(".js","");
        if(semver.gte(settings.version,version)) continue;
        for(var module in this.modules){
            if(this.modules[module].beforeUpdate) yield this.modules[module].beforeUpdate(version);
        }
        console.log("applying patch for version",version);
        yield require("./patches/"+version).call(this);
        for(var module in this.modules){
            if(this.modules[module].afterUpdate) yield this.modules[module].afterUpdate(version);
        }
        settings.version = version;
        yield settings.save();
    }
    console.log("boxify is now at version",version);
});
