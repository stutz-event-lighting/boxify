var async = require("async");
var util = require("../../../util.js");

module.exports = function(req,res){
    var type = parseInt(req.params.type,10);
    var id = parseInt(req.params.id,10);
    async.parallel([
        function(cb){
            req.app.db.collection("equipment").findOne({type:type,id:id},{id:true,type:true,comment:true,contents:true},cb);
        },
        function(cb){
            req.app.db.collection("equipmentlogs").find({type:type,id:id},{}).sort({time:-1}).toArray(cb);
        },
        function(cb){
            var query = {};
            query["items."+req.params.type+".suppliers.own.ids"] = id;
            req.app.db.collection("equipmentio").find(query,{project:true,time:true}).sort({time:1}).limit(1).toArray(function(err,io){
                if(err) return cb(err);
                if(io.length && io[0].type == "checkout"){
                    req.app.db.collection("projects").findOne({_id:io[0].project},{customer:true},function(err,project){
                        if(err || !project) return cb(err||new Error("Project does not exist"));
                        req.app.db.collection("contacts").findOne({_id:project.customer},{name:true},function(err,customer){
                            if(err || !customer) return cb(err||new Error("Customer does not exist"));
                            cb(null,customer);
                        })
                    })
                }else{
                    cb(null,null);
                }
            });
        },
        function(cb){
            var query = {};
            query["contents."+type+".ids"] = id;
            console.log(query);
            req.app.db.collection("equipment").findOne(query,{type:true,id:true},cb);
        }
    ],function(err,data){
        if(err) return res.fail();
        var types = Object.keys(data[0].contents).map(function(id){return parseFloat(id)});
        if(data[3] && types.indexOf(data[3].type) < 0) types.push(data[3].type);
        if(types.indexOf(data[0].type) < 0) types.push(data[0].type);

        req.app.db.collection("equipmenttypes").find({_id:{$in:types}},{name:true}).toArray(function(err,types){
            if(err) return res.fail();
            types = util.createIndex(types,"_id");
            data[0].name = types[data[0].type].name;
            for(var type in data[0].contents){
                data[0].contents[type].name = types[type].name;
            }
            if(data[3]) data[3].name = types[data[3].type].name;

            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify({item:data[0],logs:data[1],location:data[2],container:data[3]}));
        });
    });
}
