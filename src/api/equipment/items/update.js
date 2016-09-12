var parse = require("co-body");

module.exports = async function(ctx){

    var body = await parse.json(ctx);
    var type = parseInt(ctx.params.type,10);
    var id = parseInt(ctx.params.id,10);

    var query = {};
    if(body.remark) query.remark = body.remark;
    if(body.serialnumber) query.serialnumber = body.serialnumber;
    if(body.contents) query.contents = body.contents;

    await ctx.app.db.EquipmentItem.update({type:type,id:id},{$set:query});
    ctx.status = 200;
}
