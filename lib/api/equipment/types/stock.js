var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    var type = parseFloat(this.params.type);
    var results = yield [
        this.app.db.EquipmentType.findOne({_id:type}).select("count"),
        function*(){
            if(!body.loose) return [];
            var query = {};
            query["contents."+type] = {$exists:true};
            return yield this.app.db.EquipmentType.find(query).select("contents")
        }.bind(this)
    ]
    var type = results[0];
    var items = results[1];
    for(var i = 0; i < items.length; i++){
        type.count -= items[i].contents[type._id+""].count;
    }
    this.set("Content-Type","application/json");
    this.body = type.count+"";
}
