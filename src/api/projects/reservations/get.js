var mongo = require("mongodb");
var util = require("../../../util");
module.exports = async function(ctx){
    var results = await ctx.app.db.EquipmentReservation.findOne({_id:mongo.ObjectID(ctx.params.reservation)}).select("items")
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(results);
}
