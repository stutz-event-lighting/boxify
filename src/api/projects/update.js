var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    await ctx.app.db.Project.update({_id:mongo.ObjectID(ctx.params.id)},{$set:{name:body.name,start:body.start,end:body.end,remark:body.remark}});
    ctx.status = 200;
}
