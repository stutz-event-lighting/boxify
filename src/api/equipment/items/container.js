var mongo = require("mongodb");

module.exports = async function(ctx){
    var query = {};
    query["contents."+ctx.params.type+".ids"] = ctx.params.item;
    var item = await ctx.app.db.EquipmentItem.findOne(query);
    ctx.set("Content-Type","application/json");
    ctx.body = item?(item._id+""):"null";
}
