var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);

    var regex = {$regex:"^"+(body.tag||"").replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"}
    var tags = await ctx.app.db.EquipmentTag.find({_id:regex});
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(tags.map(function(tag){
        return tag._id;
    }));
}
