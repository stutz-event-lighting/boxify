var mongo = require("mongodb");
var async = require("async");
var calculateBalance = require("../projects/calculatebalance.js");

module.exports = function*(){
    var id = mongo.ObjectID(this.params.io);
    var io = yield this.app.db.EquipmentIo.findOne({_id:id}).select("project");
    yield [
        this.app.db.EquipmentIo.remove({_id:id}),
        calculateBalance(this.app.db,io.project)
    ];
    this.status = 200;

}
