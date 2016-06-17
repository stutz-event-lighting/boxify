var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);

    var regex = {$regex:"^"+(body.tag||"").replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"}
    var tags = yield this.app.db.EquipmentTag.find({_id:regex});
    this.set("Content-Type","application/json");
    this.body = JSON.stringify(tags.map(function(tag){
        return tag._id;
    }));
}
