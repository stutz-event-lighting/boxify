var async = require("async");

module.exports = function(db,project,cb){
    db.collection("equipmentreservations").find({project:project},{items:true}).toArray(function(err,reservations){
        if(err) return cb(err);
        var types = {};
        for(var i = 0; i < reservations.length; i++){
            var reservation = reservations[i];
            for(var type in reservation.items){
                if(!types[type]) types[type] = 0
                types[type] += reservation.items[type];
            }
        }
        db.collection("projects").update({_id:project},{$set:{reserved:types}},function(err){
            if(err) return cb(err);
            return cb(null,types);
        });
    });
}
