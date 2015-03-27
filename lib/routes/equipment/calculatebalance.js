var async = require("async");
var util = require("../../util.js");

module.exports = function(db,cb){
    async.parallel([
        function(cb){
            db.collection("equipmenttypes").find({},{count:true}).toArray(cb)
        },
        function(cb){
            db.collection("projects").find({balance:{$ne:{}}},{balance:true}).toArray(cb);
        },
        function(cb){
            db.collection("equipmentrentals").find({status:"received"},{items:true,supplier:true}).toArray(cb)
        }
    ],function(err,results){
        if(err) return cb(err);
        var types = util.createIndex(results[0],"_id");
        var projects = results[1];
        var rentals = results[2];

        for(var type in types){
            type = types[type];
            type.suppliers = {own:type.count};
        }

        for(var i = 0; i < projects.length; i++){
            var project = projects[i];
            for(var type in project.balance){
                var t = types[type];
                var item = project.balance[type];
                t.count += item.count;
                for(var supplier in item.suppliers){
                    t.suppliers[supplier] = (t.suppliers[supplier]||0) + item.suppliers[supplier];
                }
            }
        }
        for(var i = 0; i < rentals.length; i++){
            var rental = rentals[i];
            for(var type in rental.items){
                var t = types[type];
                var item = rental.items[type];
                t.count += item.count;
                t.suppliers[rental.supplier+""] = (t.suppliers[rental.supplier+""]||0)+item.count;
            }
        }
        cb(null,types);
    });
}
