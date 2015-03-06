var mongo = require("mongodb");
var async = require("async");
var Calculation = require("../stockcalculation.js");
module.exports = function(req,res){
    var id = mongo.ObjectID(req.params.id);
    async.parallel([
        function(cb){
            req.app.db.collection("projects").findOne({_id:id},{_id:true,name:true,customer:true},function(err,project){
                if(err || !project) return cb(err||new Error("Project does not exist!"))
                req.app.db.collection("customers").findOne({_id:project.customer},{name:true},function(err,customer){
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
            var calculation = new Calculation(req.app.db);
            calculation.load(id,{},function(err){
                if(err) return cb(err);
                calculation.calculateNeededItemsForRental();
                var needsRental = false;
                for(var type in calculation.types){
                    if(calculation.types[type].available < 0){
                        needsRental = true;
                        break;
                    }
                }
                cb(null,needsRental);
            });
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

        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify({project:results[0],reservations:reservations,needsRental:results[2]}));
    })
}
