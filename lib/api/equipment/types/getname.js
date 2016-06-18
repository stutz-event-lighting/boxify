module.exports = function*(){
    var type = yield this.app.db.EquipmentType.findOne({_id:parseFloat(this.params.type)}).select("name");
    this.body = type.name;
}
