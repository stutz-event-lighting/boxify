module.exports = async function(ctx){
    var categories = await ctx.app.db.EquipmentCategory.find({},{_id:true,name:true})
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(categories);
}
