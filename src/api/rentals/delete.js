var mongo = require("mongodb");

module.exports = async function(ctx){
    await ctx.app.db.EquipmentRental.remove({_id:mongo.ObjectID(ctx.params.rental)});
    ctx.status = 200;
}
