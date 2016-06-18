var mongo = require("mongodb");
module.exports = function*(){
    var id = mongo.ObjectID();
    yield this.app.db.EquipmentReservation.create({
        _id:id,
        project:mongo.ObjectID(this.params.project),
        items:{}
    });
    this.body = id+"";
}
