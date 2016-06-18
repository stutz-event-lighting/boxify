var mongo = require("mongodb");
var async = require("async");

module.exports = function*(){
    var id = mongo.ObjectID(this.params.id);
    yield [
        this.app.db.collection("equipmentreservations").remove({project:id}),
        this.app.db.collection("equipmentio").remove({project:id}),
        this.app.db.collection("projects").remove({_id:id})
    ];
    this.status = 200;
}
