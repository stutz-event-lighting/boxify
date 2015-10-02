var mongo = require("mongodb");
var async = require("async");
var util = require("../../util.js");
var calcNeeded = require("./calculateneeded.js");

module.exports = function(req,res){
    var id = mongo.ObjectID(req.params.id);
    async.parallel([
        function(cb){
            req.app.db.collection("projects").findOne({_id:id},{_id:true,name:true,customer:true,start:true,end:true,balance:true,comment:true,status:true},function(err,project){
                if(err || !project) return cb(err||new Error("Project does not exist!"))
                req.app.db.collection("contacts").findOne({_id:project.customer},{firstname:true,lastname:true},function(err,customer){
                    if(err || !customer) return cb(err||new Error("Customer does not exist!"))
                    project.customername = customer.name;
                    cb(null,project);
                })
            })
        },
        function(cb){
            req.app.db.collection("equipmentreservations").find({project:id},{items:true}).toArray(cb);
        },
        function(cb){
            calcNeeded(req.app.db,id,cb);
        },
        function(cb){
            req.app.db.collection("equipmentio").find({project:id},{type:true,time:true,items:true,user:true}).sort({time:1}).toArray(cb);
        }
    ],function(err,results){
        if(err) return res.fail();

        var reservations = results[1];
        for(var i = 0; i < reservations.length; i++){
            var reservation = reservations[i];
            reservation.count = Object.keys(reservation.items).length;
            reservation.total = Object.keys(reservation.items).map(function(type){return reservation.items[type]}).concat([0]).reduce(function(prev,val){return prev+val});
            delete reservation.items;
        }

        var needed = results[2];
        var needsRental = false;
        for(var type in needed){
            if(needed[type] > 0){
                needsRental = true;
                break;
            }
        }

        var ios = results[3];
        for(var i = 0; i < ios.length; i++){
            var io = ios[i];
            io.count = Object.keys(io.items).length;
            io.total = Object.keys(io.items).map(function(type){return io.items[type].count}).concat([0]).reduce(function(prev,val){return prev+val});
            delete io.items;
        }

        var users = Object.keys(util.createIndex(ios,"user")).map(function(id){return mongo.ObjectID(id)});

        req.app.db.collection("contacts").find({_id:{$in:users}},{firstname:true,lastname:true}).toArray(function(err,users){
            if(err) return res.fail();
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify({
                project:results[0],
                reservations:reservations,
                needsRental:needsRental,
                io:ios,
                users:util.createIndex(users,"_id")
            }));
        });
    })
}
