var mongo = require("mongodb");
module.exports = function*(){
    yield this.app.db.Project.update({_id:mongo.ObjectID(this.params.id)},{$set:{status:"finished"}});
    this.status = 200;
}
