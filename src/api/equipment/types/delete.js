module.exports = function*(){
    var id = parseFloat(this.params.id);
    yield [
        this.app.db.EquipmentType.remove({_id:id}),
        this.app.db.EquipmentItem.remove({type:id}),
        this.app.db.EquipmentLog.remove({type:id}),
        this.app.db.collection("equipmentimages.files").remove({_id:id}),
        this.app.db.collection("equipmentimages.chunks").remove({files_id:id})
    ]
    this.status = 200;
}
