var mongo = require("mongodb");
module.exports = async function(ctx){
    await ctx.app.db.Project.update({_id:mongo.ObjectID(ctx.params.id)},{$set:{status:"finished"}});
    ctx.status = 200;
}
