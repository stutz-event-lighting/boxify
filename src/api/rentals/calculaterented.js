module.exports = async function(db){
    var rentals = await db.EquipmentRental.find({status:"received"}).select("supplier items");
    var types = {};
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
    return types;
}
