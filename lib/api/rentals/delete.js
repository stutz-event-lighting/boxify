var mongo = require("mongodb");

module.exports = function*(){
    yield this.app.db.EquipmentRental.remove({_id:mongo.ObjectID(this.params.rental)});
    this.status = 200;
}
