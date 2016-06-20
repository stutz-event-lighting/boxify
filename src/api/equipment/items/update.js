var parse = require("co-body");

module.exports = function*(){

    var body = yield parse.json(this);
    var type = parseInt(this.params.type,10);
    var id = parseInt(this.params.id,10);

    var query = {};
    if(body.remark) query.remark = body.remark;
    if(body.serialnumber) query.serialnumber = body.serialnumber;
    if(body.contents) query.contents = body.contents;

    yield this.app.db.EquipmentItem.update({type:type,id:id},{$set:query});
    this.status = 200;
}
