var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var id = (await ctx.app.db.MainSettings.findByIdAndUpdate("main",{$inc:{nextEquipmenttypeId:1}},{select:"nextEquipmenttypeId"})).nextEquipmenttypeId||0;
    await ctx.app.db.EquipmentType.create({_id:id,name:body.name,technicalDescription:"",count:0,accessories:[],nextId:1});
    ctx.body = id+""
}
