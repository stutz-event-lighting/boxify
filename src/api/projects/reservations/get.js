var mongo = require("mongodb");
var util = require("../../../util");
module.exports = function*(){
    var results = yield [
        this.app.db.EquipmentReservation.findOne({_id:mongo.ObjectID(this.params.reservation)}).select("items"),
        this.app.db.EquipmentType.find({}).select("name category"),
        this.app.db.EquipmentCategory.find({}).select("name")
    ]
    this.set("Content-Type","application/json");
    this.body = JSON.stringify({
        reservation:results[0],
        types:util.createIndex(results[1],"_id"),
        categories:util.createIndex(results[2],"_id")
    });
}
