var mongo = require("mongodb");

module.exports = async function(ctx){
    var id = mongo.ObjectID(ctx.params.id);
    await Promise.all([
        ctx.app.db.collection("equipmentreservations").remove({project:id}),
        ctx.app.db.collection("equipmentio").remove({project:id}),
        ctx.app.db.collection("projects").remove({_id:id})
    ]);
    ctx.status = 200;
}
