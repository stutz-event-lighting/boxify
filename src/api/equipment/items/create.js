var parse = require("co-body");
var mongo = require("mongodb");

module.exports = async function(ctx){
    var type = parseInt(ctx.params.type,10);
    type = await ctx.app.db.EquipmentType.findOneAndUpdate(
        {_id:type},
        {$inc:{nextId:1,count:1},$set:{hasItems:true}},
        {select:"nextId"}
    );
    await Promise.all([
        ctx.app.db.EquipmentItem.create({_id:mongo.ObjectID(),id:type.nextId,type:type._id,status:"normal",serialnumber:"",remark:"",contents:{}}),
        ctx.app.db.EquipmentLog.create({_id:mongo.ObjectID(),time:new Date().getTime(),type:type._id,id:type.nextId,event:"added"})
    ]);
    ctx.body = type.nextId
}
