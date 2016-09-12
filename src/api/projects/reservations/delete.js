var mongo = require("mongodb");
var calcReserved = require("../calculatereserved");
module.exports = async function(ctx){
    await ctx.app.db.EquipmentReservation.remove({_id:mongo.ObjectID(ctx.params.reservation)});
    await calcReserved(ctx.app.db,mongo.ObjectID(ctx.params.project));
    ctx.status = 200;
}
