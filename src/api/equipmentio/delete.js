var mongo = require("mongodb");
var calculateBalance = require("../projects/calculatebalance");

module.exports = function*(){
    var id = mongo.ObjectID(this.params.io);
    var io = yield this.app.db.EquipmentIo.findOne({_id:id}).select("project");
    yield this.app.db.EquipmentIo.remove({_id:id});
    yield calculateBalance(this.app.db,io.project);
    this.status = 200;
}
