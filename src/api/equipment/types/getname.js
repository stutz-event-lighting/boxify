module.exports = async function(ctx){
    var type = await ctx.app.db.EquipmentType.findOne({_id:parseFloat(ctx.params.type)}).select("name");
    ctx.body = type.name;
}
