var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    var query = {};
    if(body.search){
        query.name = {$regex:"^"+body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"};
    }
    var rentals = yield this.app.db.EquipmentRental
        .find(query)
        .select("supplier name projects delivery return items status")
        .populate("supplier","firstname lastname")
        .populate("projects","name")

    this.set("Content-Type","application/json");
    this.body = JSON.stringify(rentals);

}
