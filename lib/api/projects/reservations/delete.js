var mongo = require("mongodb");
var calcReserved = require("../calculatereserved.js");
module.exports = function*(){
    yield this.app.db.EquipmentReservation.remove({_id:mongo.ObjectID(this.params.reservation)});
    yield calcReserved(this.app.db,mongo.ObjectID(this.params.project));
    this.status = 200;
}
