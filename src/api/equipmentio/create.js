var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    body.project = mongo.ObjectID(body.project);
    var io = {
        _id: mongo.ObjectID(),
        type: ["checkout","checkin"].indexOf(body.type)>=0?body.type:"checkout",
        project:body.project,
        draft:true,
        delivered:true,
        items:{},
        history:[]
    };
    if(body.reservation){
        io.reservation = mongo.ObjectID(body.reservation);
    }
    await ctx.app.db.EquipmentIo.create(io);
    ctx.body = io._id+"";
}
