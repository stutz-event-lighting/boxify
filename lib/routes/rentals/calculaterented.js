module.exports = function(db,cb){
    db.collection("equipmentrentals").find({status:"received"},{supplier:true,items:true}).toArray(function(err,rentals){
        if(err) return cb(err);

        var types {};
        for(var i = 0; i < rentals.length; i++){
            var rental = rentals[i];
            for(var type in rental.items){
                var item = rental.items[type];
                if(!types[type]) types[type] = {count:0,suppliers:{}};
                types[type].count += item.count;

                var supplier = types[type].suppliers[rental.supplier+""];
                if(!supplier) types[type].suppliers[rental.supplier+""] = supplier = {count:0,ids:[]}
                supplier.count += item.count;
                supplier.ids = supplier.ids.concat(item.ids);
            }
        }
        cb(null,types);
    });
}
