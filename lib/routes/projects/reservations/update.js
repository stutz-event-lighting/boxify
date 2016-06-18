var mongo = require("mongodb");
var calcProjReservations = require("../calculatereserved.js");

module.exports = function*(){
    yield this.app.db.EquipmentResevation.update({_id:mongo.ObjectID(this.params.reservation)},{$set:{items:req.body}});
    yield calcProjReservations(this.app.db,mongo.ObjectID(this.params.project));
    this.status = 200;
}
