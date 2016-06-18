var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    yield this.app.db.EquipmentTag.update({_id:this.params.tag},{$set:{_id:body.tag}});
    this.status = 200;
}
