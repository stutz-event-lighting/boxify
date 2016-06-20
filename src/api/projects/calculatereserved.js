var async = require("async");

module.exports = function*(db,project){
    var reservations = yield db.EquipmentReservation.find({project:project}).select("item");
    var types = {};
    for(var i = 0; i < reservations.length; i++){
        var reservation = reservations[i];
        for(var type in reservation.items){
            if(!types[type]) types[type] = 0
            types[type] += reservation.items[type];
        }
    }
    yield db.Project.update({_id:project},{$set:{reserved:types}});
    return types;
}
