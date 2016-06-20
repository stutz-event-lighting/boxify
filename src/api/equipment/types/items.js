module.exports = function*(){
    var id = parseInt(this.params.type,10);
    var stock = yield this.app.db.EquipmentItem.find({type:id}).select("id name");
    this.set("Content-Type","application/json");
    this.body = JSON.stringify(stock);
}
