var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    body.project = mongo.ObjectID(body.project);
    var io = {
        _id: mongo.ObjectID(),
        type: ["checkout","checkin"].indexOf(body.type)>=0?body.type:"checkout",
        project:body.project,
        draft:true,
        delivered:true,
        items:{},
        history:[]
    };
    if(body.reservation){
        io.reservation = mongo.ObjectID(body.reservation);
    }
    yield this.app.db.EquipmentIo.create(io);
    this.body = io._id+"";
}
