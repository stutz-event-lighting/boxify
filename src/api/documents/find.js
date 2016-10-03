module.exports = async function(ctx){
	var documents = await ctx.app.db.db.collection("documents.files").find({entity:ctx.query.entity}).project({_id:true,filename:true,contentType:true,length:true}).toArray()
	ctx.body = JSON.stringify(documents);
}
