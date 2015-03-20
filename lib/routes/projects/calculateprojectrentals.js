module.exports = function(db,project,cb){
    db.collection("equipmentrentals").find({project:project,status:"booked"},{items:true,supplier:true}).toArray(function(err,rentals){
        if(err) return cb(err);
        var types = {};
        for(var i = 0; i < rentals.length; i++){
            var rental = rentals[i];
            var supplier = rental.supplier+"";
            for(var type in rental.items){
                var item = rental.items[type];
                if(!types[type]) types[type] = {count:0,suppliers:{}};
                types[type].count += item;
                if(!types[type].suppliers[supplier]) types[type].suppliers[supplier] = {count:0};
                types[type].suppliers[supplier].count += item;
            }
        }
        db.collection("projects").update({_id:project},{$set:{booked:types}},cb);
    });
}
