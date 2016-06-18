var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    var id = (yield this.app.db.MainSettings.findByIdAndUpdate("main",{$inc:{nextEquipmenttypeId:1}},{select:"nextEquipmenttypeId"})).nextEquipmenttypeId||0;
    yield this.app.db.EquipmentType.create({_id:id,name:body.name,technicalDescription:"",count:0,accessories:[],nextId:1});
    this.body = id+""
}
