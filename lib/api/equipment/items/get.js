var async = require("async");
var util = require("../../../util");

module.exports = function*(){
    var type = parseInt(this.params.type,10);
    var id = parseInt(this.params.id,10);

    var data = yield [
        this.app.db.EquipmentItem.findOne({type:type,id:id}).select("id type remark contents"),
        this.app.db.EquipmentLog.find({type:type,id:id}).sort({time:-1}),
        function*(){
            var query = {draft:{$ne:true}};
            query["items."+this.params.type+".suppliers.own.ids"] = id;
            var io = yield this.app.db.EquipmentIo.findOne(query).select("project time type").sort({time:-1})
            if(io && io.type == "checkout"){
                var project = yield this.app.db.Project.findOne({_id:io.project}).select("customer");
                return yield this.app.db.Contact.findOne({_id:project.customer}).select("firstname lastname");
            }
        }.bind(this),
        function*(){
            var query = {};
            query["contents."+type+".ids"] = id+"";
            return yield this.app.db.EquipmentItem.findOne(query).select("id type");
        }.bind(this)
    ]
    var types = Object.keys(data[0].contents).map(function(id){return parseFloat(id)});
    if(data[3] && types.indexOf(data[3].type) < 0) types.push(data[3].type);
    if(types.indexOf(data[0].type) < 0) types.push(data[0].type);

    var item = JSON.parse(JSON.stringify(data[0]));
    var logs = data[1];
    var location = data[2];
    var container = data[3]

    var types = yield this.app.db.EquipmentType.find({_id:{$in:types}}).select("name");
    types = util.createIndex(types,"_id");
    item.name = types[item.type].name;
    for(var type in item.contents){
        item.contents[type].name = types[type].name;
    }
    if(container) container.name = types[container.type].name;

    this.set("Content-Type","application/json");
    this.body = JSON.stringify({item:item,logs:logs,location:location,container:container});
}
