var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
	var body = await parse.json(ctx,{limit:"10mb"});
	if(typeof body.entity != "string") ctx.throw(400,"'entity' must be a string");
	if(typeof body.name != "string") ctx.throw(400,"'name' must be a string");
	if(typeof body.file != "string") ctx.throw(400,"'file' must be a string");

	var parts = body.file.split(",");
	var mime = parts[0].substring(5,parts[0].length-7);
	var data = new Buffer(parts[1],"base64");

	var id = new mongo.ObjectID();

	var store = new mongo.GridStore(ctx.app.db.db,id,body.name,"w",{root:"documents",content_type:mime});
	await store.open();
	await store.write(data,true);

	await ctx.app.db.db.collection("documents.files").update({_id:id},{$set:{entity:body.entity}});
	ctx.body = id+"";
}
