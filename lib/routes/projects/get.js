var mongo = require("mongodb");
var async = require("async");
var util = require("../../util.js");
var calcNeeded = require("./calculateneeded.js");

module.exports = function(req,res){
    var id = mongo.ObjectID(req.params.id);
    async.parallel([
        function(cb){
            req.app.db.collection("projects").findOne({_id:id},{_id:true,name:true,customer:true},function(err,project){
                if(err || !project) return cb(err||new Error("Project does not exist!"))
                req.app.db.collection("contacts").findOne({_id:project.customer},{name:true},function(err,customer){
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
            req.app.db.collection("equipmentio").find({project:id},{type:true,time:true,items:true}).toArray(cb);
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

        var io = results[3];

        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({
            project:results[0],
            reservations:reservations,
            needsRental:needsRental,
            io:io
        }));
    })
}
