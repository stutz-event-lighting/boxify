var mongo = require("mongodb");
module.exports = async function(ctx){
	var store = new mongo.GridStore(ctx.app.db.db,mongo.ObjectID(ctx.params.document),"w",{root:"documents"});
    try{
        await store.open();
		await store.unlink();
        await store.close();
		ctx.status = 200;
    }catch(e){
        ctx.throw(404);
    }
}
