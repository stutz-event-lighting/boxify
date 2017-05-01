var fs = require("fs");
var crypto = require("crypto");
var path = require("path");
var semver = require("semver");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var fsp = require("fs-promise");
var koa = require("koa");
var compose = require("koa-compose");
var mount = require("koa-mount");
var route = require("koa-route");
var compress = require("koa-compress");
var serve = require("koa-static");
var send = require("koa-send");
var pug = require("pug");
var App = require("./views/app")
require("babel-polyfill")

var page = pug.compile(fs.readFileSync(path.resolve(__dirname,"../views/page.jade")));

var Boxify = module.exports = function Boxify(config){
    this.config = config;
    this.app = new koa();
    this.modules = {};
    this.moduleclients = [];
    this.permissions = {};
    this.db = null;

    this.app.app = this;
    this.app.use(async function(ctx,next){
        try{
            await next();
        }catch(e){
            if(e.status){
                ctx.status = e.status;
                ctx.message = e.message;
            }else{
                ctx.status = 500;
                ctx.body = e.message+e.stack;
            }
        }
    })
    this.app.use(compress());
    this.app.use(mount("/public",serve(path.resolve(__dirname,"../public"))));
    this.app.use(mount("/public/bootstrap",serve(path.resolve(__dirname,"../node_modules/bootstrap/dist"))));
    this.app.use(mount("/public/react-widgets",serve(path.resolve(__dirname,"../node_modules/react-widgets/dist"))));
    this.app.use(mount("/public/react-select",serve(path.resolve(__dirname,"../node_modules/react-select/dist"))));
    this.app.use(route.get("/main.js",async function(ctx){
        await send(ctx,"lib/main.js");
    }));

    this.app.use(async function(ctx,next){
        ctx.app = this;
        await next();
    }.bind(this));

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
        this.modules[module] = require(module).server(this,config.modules[module]);
        this.moduleclients.push(module);
        this.app.use(route.get("/modules/"+module+".js",async function(ctx){
            await send(ctx,"build.js",{root:path.dirname(require.resolve(module+"/lib/build.js"))});
        }))
    }

    this.app.use(async function(ctx,next){
        if(App.router.route(ctx.path)){
            ctx.set("Content-Type","text/html");
            ctx.body = page({modules:this.moduleclients,onlyoffice:ctx.app.config.onlyoffice});
        }else{
            await next();
        }
    }.bind(this))
}

Boxify.prototype.addPermission = function(id,name){
    this.permissions[id] = name;
}

Boxify.prototype.start = async function(){
    var con = mongoose.connect("mongodb://"+this.config.dbpath+"/boxify");
    var db = con.connection;
    await con;
    require("./models")(db);
    this.db = db;
    this.app.db = db;

    await this.update();

    for(var module in this.modules){
        await this.modules[module].start();
    }

    this.app.listen(this.config.port||80);
}

Boxify.prototype.update = async function(cb){
    var patches = await fsp.readdir(path.resolve(__dirname,"./patches"));
    var settings = await this.db.MainSettings.findOne({_id:"main"});

    if(!settings){
        settings = new this.db.MainSettings({_id:"main"});
        await settings.save();
    }

    if(!settings.version){
        settings.version = "0.0.0";
        await settings.save();
    }
    var lastversion = "0.0.0";

    for(var version in patches){
        version = patches[version].replace(".js","");
        if(semver.gte(settings.version,version)) continue;
        for(var module in this.modules){
            if(this.modules[module].beforeUpdate) await this.modules[module].beforeUpdate(version);
        }
        console.log("applying patch for version",version);
        await require("./patches/"+version).call(this);
        for(var module in this.modules){
            if(this.modules[module].afterUpdate) await this.modules[module].afterUpdate(version);
        }
        settings.version = version;
        await settings.save();
    }
    console.log("boxify is now at version",version);
};
