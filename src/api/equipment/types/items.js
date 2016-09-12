module.exports = async function(ctx){
    var id = parseInt(ctx.params.type,10);
    var stock = await ctx.app.db.EquipmentItem.find({type:id}).select("id name");
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(stock);
}
