var mongo = require("mongodb");

module.exports = function*(){
    var query = {};
    query["contents."+this.params.type+".ids"] = this.params.item;
    var item = yield this.app.db.EquipmentItem.findOne(query);
    this.set("Content-Type","application/json");
    this.body = item?(item._id+""):"null";
}
