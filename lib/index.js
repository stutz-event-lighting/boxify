var http = require("http");
var fs = require("fs");
var crypto = require("crypto");
var browserify = require("browserify");
var jade2react = require("jade2react");
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
var pug = require("pug");

var page = pug.compile(fs.readFileSync(path.resolve(__dirname,"../views/page.jade")));

var Boxify = module.exports = function Boxify(config){
    var self = this;

    this.config = config;
    this.app = koa();
    this.server = http.createServer(this.app.callback());
    this.routes = [];
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
    this.app.use(route.get("/main.js",function*(next){
        var build = yield self.build;
        if(this.get("if-none-match") === build.etag){
            this.status = 304;
            return;
        }
        this.set("Content-Type","text/javascript");
        this.set("ETag",build.etag);
        this.set("Cache-Control","public, max-age=0");
        this.body = build.script;
        yield next;
    }));

    this.app.use(function*(next){
        this.app = self;
        yield next;
    });

    //UI routes
    this.addRoute("/",require.resolve("./views/main.jade"));
    this.addRoute("/equipment",require.resolve("./views/equipment.jade"));
    this.addRoute("/equipment/categories",require.resolve("./views/equipmentcategories.jade"));
    this.addRoute("/equipment/:type",require.resolve("./views/equipmenttype.jade"));
    this.addRoute("/equipment/:type/:id",require.resolve("./views/equipmentitem.jade"));
    this.addRoute("/contacts/:contact",require.resolve("./views/contact.jade"));
    this.addRoute("/users",require.resolve("./views/users.jade"));
    this.addRoute("/users/:user",require.resolve("./views/user.jade"));
    this.addRoute("/customers",require.resolve("./views/customers.jade"));
    this.addRoute("/customers/:customer",require.resolve("./views/customer.jade"));
    this.addRoute("/suppliers",require.resolve("./views/suppliers.jade"));
    this.addRoute("/suppliers/:supplier",require.resolve("./views/supplier.jade"));
    this.addRoute("/projects",require.resolve("./views/projects.jade"));
    this.addRoute("/projects/:id",require.resolve("./views/project.jade"));
    this.addRoute("/projects/:project/reservations/:reservation",require.resolve("./views/reservation.jade"));
    this.addRoute("/projects/:project/checkouts/:checkout",require.resolve("./views/checkout.jade"));
    this.addRoute("/projects/:project/checkins/:checkin",require.resolve("./views/checkin.jade"));
    this.addRoute("/rentals",require.resolve("./views/rentals.jade"));
    this.addRoute("/rentals/:rental",require.resolve("./views/rental.jade"));
    this.addRoute("/profile",require.resolve("./views/profile.jade"));

    this.app.use(mount("/api",require("./api")));

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

    this.build = new Promise((fullfill,reject)=>{
        var bundle = browserify();
        bundle.transform(jade2react,{global:true});
        bundle.add(require.resolve("./app.js"));
        for(var i = 0; i < this.routes.length; i++){
            bundle.require(this.routes[i].componentPath);
        }
        bundle.bundle((err,build)=>{
            if(err) return reject(err);
            fullfill({script:build,etag:'W/"'+crypto.createHash("md5").update(build).digest("hex")+'"'})
        });
    });
    this.build.catch(function(err){
        console.log("Build failed!");
        console.log(err.message+err.stack);
    })
}

Boxify.prototype.addRoute = function(path,componentPath){
    var self = this;
    this.app.use(route.get(path,function*(){
        this.set("Content-Type","text/html");
        this.body = page({data:{routes:self.routes}});
    }));
    this.routes.push({
        path:path,
        componentPath:componentPath.replace(/\\/g,"/")
    });
}

Boxify.prototype.addPermission = function(id,name){
    this.permissions[id] = name;
}

Boxify.prototype.start = co.wrap(function*(){

    var con = mongoose.connect("mongodb://"+this.config.dbpath+"/boxify");
    var db = con.connection;
    yield con;
    require("./models.js")(db);
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
        yield require("./patches/"+version+".js").call(this);
        for(var module in this.modules){
            if(this.modules[module].afterUpdate) yield this.modules[module].afterUpdate(version);
        }
        settings.version = version;
        yield settings.save();
    }
    console.log("boxify is now at version",version);
});
