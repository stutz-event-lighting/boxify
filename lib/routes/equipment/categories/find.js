module.exports = function*(){
    var categories = yield this.app.db.EquipmentCategory.find({},{_id:true,name:true})
    this.set("Content-Type","application/json");
    this.body = JSON.stringify(categories);
}
