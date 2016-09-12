var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var category = await ctx.app.db.EquipmentCategory.create({_id:new mongo.ObjectID(),name:body.name});
    ctx.body = category._id+"";
}
