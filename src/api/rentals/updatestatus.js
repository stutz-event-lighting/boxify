var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    yield this.app.db.EquipmentRental.update({_id:mongo.ObjectID(this.params.rental)},{$set:{status:body.status}});
    this.status = 200;
}
