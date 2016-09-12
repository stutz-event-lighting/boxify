var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var type = parseFloat(ctx.params.type);
    var results = await Promise.all([
        ctx.app.db.EquipmentType.findOne({_id:type}).select("count"),
        async function(){
            if(!body.loose) return [];
            var query = {};
            query["contents."+type] = {$exists:true};
            return await ctx.app.db.EquipmentType.find(query).select("contents")
        }.call(ctx)
    ])
    var type = results[0];
    var items = results[1];
    for(var i = 0; i < items.length; i++){
        type.count -= items[i].contents[type._id+""].count;
    }
    ctx.set("Content-Type","application/json");
    ctx.body = type.count+"";
}
