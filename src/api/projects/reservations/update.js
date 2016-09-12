var mongo = require("mongodb");
var calcProjReservations = require("../calculatereserved");
var parse = require("co-body");

module.exports = async function(ctx){
    await ctx.app.db.EquipmentReservation.update({_id:mongo.ObjectID(ctx.params.reservation)},{$set:{items: await parse(ctx)}});
    await calcProjReservations(ctx.app.db,mongo.ObjectID(ctx.params.project));
    ctx.status = 200;
}
