var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var id = parseInt(ctx.params.type);

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

    await Promise.all([
        ctx.app.db.EquipmentType.update({_id:id},query),
        ctx.app.db.EquipmentLog.create({time:new Date().getTime(),type:id,count:body.count,event:body.type=="add"?"added":"removed"})
    ])
    ctx.status = 200;
}
