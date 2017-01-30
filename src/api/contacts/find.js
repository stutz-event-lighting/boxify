var parse = require("co-body");
module.exports = async function(ctx,role){
    var body = await parse.json(ctx);
    var query = {};
    if(body.search){
        var words = body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/\s\s+/g," ").split(" ");
        var needed = [];
        for(var word of words){
            var q = [
                {firstname:{$regex:word,$options:"i"}},
                {lastname:{$regex:word,$options:"i"}}
            ];
            needed.push({
                $or:q
            })
        }
        if(needed.length){
            query.$and = needed;
        }
    }
    if(body.role){
        query.roles = body.role;
    }
    if(body.type){
        query.type = body.type;
    }
    if(typeof role == "string"){
        query.roles = role;
    }
    var items = await ctx.app.db.Contact.find(query,"firstname lastname");
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(items);
}
