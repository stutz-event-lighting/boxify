var util = require("../../../util");

module.exports = async function(ctx){
    var type = parseInt(ctx.params.type,10);
    var id = parseInt(ctx.params.id,10);

    var data = await Promise.all([
        ctx.app.db.EquipmentItem.findOne({type:type,id:id}).select("id type remark contents"),
        ctx.app.db.EquipmentLog.find({type:type,id:id}).sort({time:-1}),
        async function(){
            var query = {draft:{$ne:true}};
            query["items."+ctx.params.type+".suppliers.own.ids"] = id;
            var io = await ctx.app.db.EquipmentIo.findOne(query).select("project time type").sort({time:-1})
            if(io && io.type == "checkout"){
                var project = await ctx.app.db.Project.findOne({_id:io.project}).select("customer");
                return await ctx.app.db.Contact.findOne({_id:project.customer}).select("firstname lastname");
            }
        }.call(ctx),
        async function(){
            var query = {};
            query["contents."+type+".ids"] = id+"";
            return await ctx.app.db.EquipmentItem.findOne(query).select("id type");
        }.call(ctx)
    ])
    var types = Object.keys(data[0].contents).map(function(id){return parseFloat(id)});
    if(data[3] && types.indexOf(data[3].type) < 0) types.push(data[3].type);
    if(types.indexOf(data[0].type) < 0) types.push(data[0].type);

    var item = JSON.parse(JSON.stringify(data[0]));
    var logs = data[1];
    var location = data[2];
    var container = data[3]

    var types = await ctx.app.db.EquipmentType.find({_id:{$in:types}}).select("name");
    types = util.createIndex(types,"_id");
    item.name = types[item.type].name;
    for(var type in item.contents){
        item.contents[type].name = types[type].name;
    }
    if(container) container.name = types[container.type].name;

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify({item:item,logs:logs,location:location,container:container});
}
