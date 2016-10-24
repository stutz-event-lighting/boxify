var mongo = require("mongodb");

module.exports = async function(ctx){
    var store = new mongo.GridStore(ctx.app.db.db,mongo.ObjectID(ctx.params.document),"r",{root:"documents"});
    try{
        await store.open();
		ctx.body = await store.read();
		ctx.set("Content-Type",store.contentType);
        ctx.set("Content-Disposition","attachment; filename=\""+store.filename+"\"");
        await store.close();
    }catch(e){
        ctx.throw(404);
    }
}
