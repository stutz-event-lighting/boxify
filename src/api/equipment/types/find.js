var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);

    var query = {};
    if(body.search){

        var words = body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/\s\s+/g," ").split(" ");
        var needed = [];
        for(var i = 0; i < words.length; i++){
            needed.push({
                $or:[
                    {name:{$regex:words[i],$options:"i"}},
                    {manufacturer:{$regex:words[i],$options:"i"}},
                    {tags:{$regex:words[i],$options:"i"}}
                ]
            })
        }
        if(needed.length){
            query.$and = needed;
        }
    }
    var items = await ctx.app.db.EquipmentType.find(query).select("name manufacturer category count weight height width length");
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(items);
}
