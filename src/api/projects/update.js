var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    yield this.app.db.Project.update({_id:mongo.ObjectID(this.params.id)},{$set:{name:body.name,start:body.start,end:body.end,remark:body.remark}});
    this.status = 200;
}
