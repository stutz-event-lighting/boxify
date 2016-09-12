var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var query = {};
    if(body.search){
        query.name = {$regex:"^"+body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"};
    }
    if(body.finished !== true){
        query.status = "ongoing";
    }
    var projects = await ctx.app.db.Project
        .find(query)
        .select("name customer start end status")
        .populate("customer","firstname lastname")
        .sort({start:1});

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(projects);
}
