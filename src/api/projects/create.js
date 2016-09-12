var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var customer = parseFloat(body.customer);
    var c = await ctx.app.db.Contact.findOneAndUpdate(
        {_id:customer},
        {$inc:{lastProjectNumber:1}},
        {select:"lastProjectNumber",new:true}
    );
    var id = mongo.ObjectID();
    await ctx.app.db.Project.create({_id:id,customer:customer,projectNumber:c.lastProjectNumber,name:body.name,start:body.start,end:body.end,balance:{},needs:{},status:"ongoing"});
    ctx.body = id+"";
}
