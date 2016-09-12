module.exports = async function(ctx){
    var id = parseFloat(ctx.params.id);
    await Promise.all([
        ctx.app.db.EquipmentType.remove({_id:id}),
        ctx.app.db.EquipmentItem.remove({type:id}),
        ctx.app.db.EquipmentLog.remove({type:id}),
        ctx.app.db.collection("equipmentimages.files").remove({_id:id}),
        ctx.app.db.collection("equipmentimages.chunks").remove({files_id:id})
    ])
    ctx.status = 200;
}
