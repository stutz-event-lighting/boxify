var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    yield this.app.db.EquipmentCategory.update({_id:mongo.ObjectID(this.params.id)},{$set:{name:body.name}});
    this.status = 200;
}
