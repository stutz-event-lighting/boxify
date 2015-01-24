var express = require("express");
var fs = require("fs");
var browserify = require("browserify");
var jade2react = require("jade2react");
var path = require("path");
var mongo = require("mongodb");
var bp = require("body-parser");
var async = require("async");


function App(){
    var self = this;
    this.app = express();
    this.buildCallbacks = [];
    this.routes = [];
    this.build = null;
    this.db = null;

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

    this.addRoute("/",require.resolve("./main.jade"));
    this.addRoute("/equipment",require.resolve("./equipment.jade"));
    this.addRoute("/equipment/:type",require.resolve("./equipmenttype.jade"));
    this.addRoute("/equipment/:type/:id",require.resolve("./equipmentitem.jade"))

    this.app.post("/api/equipment",bp.json(),function(req,res){
        self.db.collection("equipmenttypes").find({type:null},{_id:true,name:true,count:true,weight:true,height:true,width:true,length:true}).toArray(function(err,items){
            if(err) return res.fail(err);
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify(items));
        });
    });

    this.app.post("/api/equipment/create",bp.json(),function(req,res){
        self.db.collection("idcounters").findAndModify(
            {collection:"equipmenttypes"},
            null,
            {$inc:{nextId:1}},
            {fields:{nextId:true}}
        ,function(err,item){
            if(err) return res.fail();
            self.db.collection("equipmenttypes").insert({_id:item.nextId,name:req.body.name,count:0,accessories:[],nextId:1},function(err){
                if(err) return res.fail();
                res.end(item.nextId+"");
            });
        });
    });
    this.app.get("/api/equipment/:id",function(req,res){
        var id = parseInt(req.params.id,10);
        async.parallel([
            function(cb){
                self.db.collection("equipmenttypes").findOne({_id:id},{_id:true,name:true,count:true,weight:true,height:true,width:true,length:true,accessories:true},function(err,item){
                    if(err || item == null) return cb(err||new Error("Equipmenttype not found"));
                    if(item.accessories.length){
                        var accessoriesbyid = {};
                        self.db.collection("equipmenttypes").find({_id:item.accessories.map(function(accessory){
                            accessoriesbyid[accessory._id] = accessory;
                            return accessory._id
                        })},{name:true}).toArray(function(err,accessories){
                            for(var i = 0; i < accessories.length; i++){
                                accessoriesbyid[accessories[i]._id].name = accessories[i].name
                            }
                            cb(null,item);
                        })
                    }else{
                        cb(null,item);
                    }
                })
            },
            function(cb){
                self.db.collection("equipment").find({type:id},{id:true,name:true}).toArray(function(err,stock){
                    if(err) return cb(err);
                    cb(null,stock);
                })
            }
        ],function(err,d){
            if(err) return res.fail();
            var item = d[0];
            item.stock = d[1];
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify(item));
        });
    })
    this.app.post("/api/equipment/:id",bp.json(),function(req,res){
        var id = parseInt(req.params.id,10);
        var query = {$set:{
            name:req.body.name
        },$unset:{}};

        if(req.body.weight === undefined){
            query.$unset.weight = 1;
        }else{
            query.$set.weight = req.body.weight;
        }
        if(req.body.length === undefined){
            query.$unset.length = 1;
        }else{
            query.$set.length = req.body.length;
        }
        if(req.body.width === undefined){
            query.$unset.width = 1;
        }else{
            query.$set.width = req.body.width;
        }
        if(req.body.height === undefined){
            query.$unset.height = 1;
        }else{
            query.$set.height = req.body.height;
        }

        if(!Object.keys(query.$unset).length) delete query.$unset;

        self.db.collection("equipmenttypes").update({_id:id},query,function(err){
            if(err) return res.fail();
            res.end();
        });
    });

    this.app.post("/api/equipment/:type/count",bp.json(),function(req,res){
        var id = parseInt(req.params.type);

        var query = {};
        switch(req.body.type){
            case "add":
                query.$inc = {count:req.body.count};
                break;
            case "remove":
                query.$inc = {count:-req.body.count};
                break;
            default:
                return res.fail(601,"Invalid type");
        }

        async.parallel([
            function(cb){
                self.db.collection("equipmenttypes").update({_id:id},query,cb)
            },
            function(cb){
                self.db.collection("equipmentlogs").insert({time:new Date().getTime(),type:id,count:req.body.count,event:req.type=="add"?"added":"removed"},cb);
            }
        ],function(err){
            if(err) return res.fail();
            res.end();
        });
    });

    this.app.post("/api/equipment/:type/create",bp.json(),function(req,res){
        var type = parseInt(req.params.type,10);
        self.db.collection("equipmenttypes").findAndModify(
            {_id:type},
            null,
            {$inc:{nextId:1,count:1}},
            {fields:{nextId:true}},
            function(err,type){
                if(err) return res.fail();
                async.parallel([
                    function(cb){
                        self.db.collection("equipment").insert({id:type.nextId,type:type._id,name:req.body.name,status:"normal"},cb)
                    },function(cb){
                        self.db.collection("equipmentlogs").insert({time:new Date().getTime(),type:type._id,id:type.nextId,event:"added"},cb);
                    }
                ],function(err){
                    if(err) return res.fail();
                    res.end(type.nextId+"");
                })
            }
        )
    });
    this.app.post("/api/equipment/:type/:id",bp.json(),function(req,res){
        var type = parseInt(req.params.type,10);
        var id = parseInt(req.params.id,10);
        self.db.collection("equipment").update({type:type,id:id},{$set:{name:req.body.name}},function(err){
            if(err) return res.fail();
            res.end();
        });
    });

    this.app.get("/api/equipment/:type/:id/delete",function(req,res){
        var type = parseInt(req.params.type,10);
        var id = parseInt(req.params.id,10);
        async.parallel([
            function(cb){
                self.db.collection("equipment").remove({type:type,id:id},cb)
            },
            function(cb){
                self.db.collection("equipmenttypes").update({_id:type},{$inc:{count:-1}},cb);
            },
            function(cb){
                self.db.collection("equipmentlogs").insert({time:new Date().getTime(),type:type,id:id,event:"removed"},cb)
            }
        ],function(err){
            if(err) return res.fail();
            res.end();
        })
    });
}

App.prototype.addRoute = function(path,componentPath){
    var self = this;
    this.app.get(path,function(req,res){
        res.render(require.resolve("./page.jade"),{data:{routes:self.routes}});
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
    mongo.connect("mongodb://cloudstudios.ch/sel",function(err,db){
        if(err) throw err;
        self.db = db;
        self.app.listen(80);
        console.log("listening...");
    });
}

var app = new App();
app.start();
