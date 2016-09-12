var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    if(ctx.params.rental.length != 24) ctx.params.rental = mongo.ObjectID()+"";
    await ctx.app.db.EquipmentRental.update({_id:mongo.ObjectID(ctx.params.rental)},{$set:{
        name:body.name,
        supplier:parseFloat(body.supplier),
        delivery:body.delivery,
        return:body.return,
        status:body.status,
        items:body.items,
        projects:body.projects||[]
    }},{upsert:true});
    ctx.status = 200;
}
