var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    var id = parseInt(this.params.type);

    var query = {};
    switch(body.type){
        case "add":
            query.$inc = {count:body.count};
            break;
        case "remove":
            query.$inc = {count:-body.count};
            break;
        default:
            return res.fail(601,"Invalid type");
    }

    yield [
        this.app.db.EquipmentType.update({_id:id},query),
        this.app.db.EquipmentLog.create({time:new Date().getTime(),type:id,count:body.count,event:body.type=="add"?"added":"removed"})
    ]
    this.status = 200;
}
