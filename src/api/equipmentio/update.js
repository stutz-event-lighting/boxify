var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    await ctx.app.db.EquipmentIo.update({_id:mongo.ObjectID(ctx.params.io)},{$set:{
        person:body.person?parseFloat(body.person):null,
        items:body.items,
        history:body.history
    }});
    ctx.status = 200;
}
