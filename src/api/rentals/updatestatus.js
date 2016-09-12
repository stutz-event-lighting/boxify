var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    await ctx.app.db.EquipmentRental.update({_id:mongo.ObjectID(ctx.params.rental)},{$set:{status:body.status}});
    ctx.status = 200;
}
