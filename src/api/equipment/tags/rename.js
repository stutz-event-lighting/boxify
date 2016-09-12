var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    await ctx.app.db.EquipmentTag.update({_id:ctx.params.tag},{$set:{_id:body.tag}});
    ctx.status = 200;
}
