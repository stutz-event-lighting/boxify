var async = require("async");
var calcEquipmentBalance = require("../equipment/calculatebalance.js");

module.exports = function(db,project,cb){
    db.collection("projects").findOne({_id:project},{start:true,end:true},function(err,project){
        if(err) return cb(err);
        async.parallel([
            function(cb){
                calcEquipmentBalance(db,cb)
            },function(cb){
                db.collection("equipmentrentals").find({status:"received"},{supplier:true,items:true}).toArray(cb)
            }
        ],function(err,results){
            if(err) return cb(err);

            var balance = results[0];
            var rentals = results[1];

            for(var i = 0; i < rentals.length; i++){
                var rental = rentals[i];
                for(var type in rental.items){
                    balance[type].count += rental.items[type].count;
                    var supplier = balance[type].suppliers[rental.supplier+""];
                    if(!supplier) balance[type].suppliers[rental.supplier+""] = supplier = {count:0,ids:[]};
                    supplier.count += rental.items[type].count;
                    supplier.ids = supplier.ids.concat(rental.items[type].ids);
                }
            }
            cb(null,balance);
        })
    })
}
