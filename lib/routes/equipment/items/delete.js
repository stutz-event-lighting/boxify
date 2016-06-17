var async = require("async");
module.exports = function*(){
    var type = parseInt(this.params.type,10);
    var id = parseInt(this.params.id,10);
    yield [
        this.app.db.EquipmentItem.remove({type:type,id:id}),
        function*(){
            yield this.app.db.EquipmentType.update({_id:type},{$inc:{count:-1}});
            yield this.app.db.EquipmentType.update({_id:type,count:0},{$unset:{hasItems:true}},cb);
        }.bind(this),
        this.app.db.EquipmentLog.create({time:new Date().getTime(),type:type,id:id,event:"removed"})
    ]

    this.status = 200;
}
