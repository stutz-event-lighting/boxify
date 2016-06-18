var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    var category = yield this.app.db.EquipmentCategory.create({_id:new mongo.ObjectID(),name:body.name});
    this.body = category._id+"";
}
