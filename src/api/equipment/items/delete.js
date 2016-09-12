var mongo = require("mongodb");
module.exports = async function(ctx){
    var type = parseInt(ctx.params.type,10);
    var id = parseInt(ctx.params.id,10);
    await Promise.all([
        ctx.app.db.EquipmentItem.remove({type:type,id:id}),
        async function(){
            await ctx.app.db.EquipmentType.update({_id:type},{$inc:{count:-1}});
            await ctx.app.db.EquipmentType.update({_id:type,count:0},{$unset:{hasItems:true}});
        }.call(ctx),
        ctx.app.db.EquipmentLog.create({_id:mongo.ObjectID(),time:new Date().getTime(),type:type,id:id,event:"removed"})
    ])

    ctx.status = 200;
}
