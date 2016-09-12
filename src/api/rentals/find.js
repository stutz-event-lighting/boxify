var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var query = {};
    if(body.search){
        query.name = {$regex:"^"+body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"};
    }
    var rentals = await ctx.app.db.EquipmentRental
        .find(query)
        .select("supplier name projects delivery return items status")
        .populate("supplier","firstname lastname")
        .populate("projects","name")

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(rentals);

}
