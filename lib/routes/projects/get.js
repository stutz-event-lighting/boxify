var mongo = require("mongodb");
var async = require("async");
var Calculation = require("../../stockcalculation.js");
var util = require("../../util.js");
var calcTotalBalance = require("../equipment/calculatetotalbalance.js");
var calcMaxNeeds = require("../equipment/calculatemaxneeds.js");

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
            calcTotalBalance(req.app.db,cb)
        },
        function(cb){
            req.app.db.collection("equipmentrentals").find({project:id},{supplier:true,status:true,items:true}).toArray(cb);
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

        var suppliers = {};
        var rentals = results[3];
        for(var i = 0; i < rentals.length; i++){
            var rental = rentals[i];
            rental.count = Object.keys(rental.items).length;
            rental.total = Object.keys(rental.items).map(function(type){return rental.items[type]}).concat([0]).reduce(function(prev,val){return prev+val});
            delete rental.items;
            suppliers[rental.supplier+""] = true;
        }
        suppliers = Object.keys(suppliers).map(function(supplier){return mongo.ObjectID(supplier)});

        req.app.db.collection("contacts").find({_id:{$in:suppliers}},{name:true}).toArray(function(err,suppliers){
            if(err) return res.fail();

            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify({
                project:results[0],
                reservations:reservations,
                rentals:rentals,
                suppliers:util.createIndex(suppliers,"_id"),
                needsRental:results[2]
            }));
        })
    })
}
