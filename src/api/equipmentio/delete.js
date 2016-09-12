var mongo = require("mongodb");
var calculateBalance = require("../projects/calculatebalance");

module.exports = async function(ctx){
    var id = mongo.ObjectID(ctx.params.io);
    var io = await ctx.app.db.EquipmentIo.findOne({_id:id}).select("project");
    await ctx.app.db.EquipmentIo.remove({_id:id});
    await calculateBalance(ctx.app.db,io.project);
    ctx.status = 200;
}
