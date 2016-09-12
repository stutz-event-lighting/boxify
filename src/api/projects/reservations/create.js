var mongo = require("mongodb");
module.exports = async function(ctx){
    var id = mongo.ObjectID();
    await ctx.app.db.EquipmentReservation.create({
        _id:id,
        project:mongo.ObjectID(ctx.params.project),
        items:{}
    });
    ctx.body = id+"";
}
