var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    if(this.params.rental.length != 24) this.params.rental = mongo.ObjectID()+"";
    yield this.app.db.EquipmentRental.update({_id:mongo.ObjectID(this.params.rental)},{$set:{
        name:body.name,
        supplier:parseFloat(body.supplier),
        delivery:body.delivery,
        return:body.return,
        status:body.status,
        items:body.items,
        projects:body.projects||[]
    }},{upsert:true});
    this.status = 200;
}
