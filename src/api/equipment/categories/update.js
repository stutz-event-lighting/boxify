var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    await ctx.app.db.EquipmentCategory.update({_id:mongo.ObjectID(ctx.params.id)},{$set:{name:body.name}});
    ctx.status = 200;
}
