var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    yield this.app.db.EquipmentIo.update({_id:mongo.ObjectID(this.params.io)},{$set:{
        person:body.person?parseFloat(body.person):null,
        items:body.items,
        history:body.history
    }});
    this.status = 200;
}
