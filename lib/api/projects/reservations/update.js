var mongo = require("mongodb");
var calcProjReservations = require("../calculatereserved");
var parse = require("co-body");

module.exports = function*(){
    yield this.app.db.EquipmentReservation.update({_id:mongo.ObjectID(this.params.reservation)},{$set:{items: yield parse(this)}});
    yield calcProjReservations(this.app.db,mongo.ObjectID(this.params.project));
    this.status = 200;
}
