var mongo = require("mongodb");
module.exports = async function(ctx){
    var count = await ctx.app.db.EquipmentType.count({category:mongo.ObjectID(ctx.params.id)});
    if(count) ctx.throw(400,"Category in use");
    await ctx.app.db.EquipmentCategory.remove({_id:mongo.ObjectID(ctx.params.id)});
    ctx.status = 200;
}
