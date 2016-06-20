var mongo = require("mongodb");
module.exports = function*(){
    var count = yield this.app.db.EquipmentType.count({category:mongo.ObjectID(this.params.id)});
    if(count) this.throw(400,"Category in use");
    yield this.app.db.EquipmentCategory.remove({_id:mongo.ObjectID(this.params.id)});
    this.status = 200;
}
