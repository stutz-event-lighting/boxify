var async = require("async");
var parse = require("co-body");

module.exports = function*(){
    var type = parseInt(this.params.type,10);
    type = yield this.app.db.EquipmentType.findOneAndUpdate(
        {_id:type},
        {$inc:{nextId:1,count:1},$set:{hasItems:true}},
        {select:"nextId"}
    );
    yield [
        this.app.db.EquipmentItem.create({id:type.nextId,type:type._id,status:"normal",serialnumber:"",remark:"",contents:{}}),
        this.app.db.EquipmentLog.create({time:new Date().getTime(),type:type._id,id:type.nextId,event:"added"})
    ];
    this.status = 200;
}
