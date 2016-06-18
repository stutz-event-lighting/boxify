var async = require("async");
var parse = require("co-body");
var mongo = require("mongodb");

module.exports = function*(){
    var type = parseInt(this.params.type,10);
    type = yield this.app.db.EquipmentType.findOneAndUpdate(
        {_id:type},
        {$inc:{nextId:1,count:1},$set:{hasItems:true}},
        {select:"nextId"}
    );
    yield [
        this.app.db.EquipmentItem.create({_id:mongo.ObjectID(),id:type.nextId,type:type._id,status:"normal",serialnumber:"",remark:"",contents:{}}),
        this.app.db.EquipmentLog.create({_id:mongo.ObjectID(),time:new Date().getTime(),type:type._id,id:type.nextId,event:"added"})
    ];
    this.body = type.nextId
}
