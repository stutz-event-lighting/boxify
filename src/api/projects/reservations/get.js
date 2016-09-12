var mongo = require("mongodb");
var util = require("../../../util");
module.exports = async function(ctx){
    var results = await Promise.all([
        ctx.app.db.EquipmentReservation.findOne({_id:mongo.ObjectID(ctx.params.reservation)}).select("items"),
        ctx.app.db.EquipmentType.find({}).select("name category"),
        ctx.app.db.EquipmentCategory.find({}).select("name")
    ])
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify({
        reservation:results[0],
        types:util.createIndex(results[1],"_id"),
        categories:util.createIndex(results[2],"_id")
    });
}
