var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
	var offer = await parse.json(ctx);
	offer.project = mongo.ObjectID(offer.project);
	for(var project of offer.projects){
		for(var item of project.items){
			if(item.type) item.type = parseFloat(item.type);
			if(item.category) item.category = mongo.ObjectID(item.category)
		}
	}

	await ctx.app.db.Offer.update({_id:mongo.ObjectID(ctx.params.offer)},{$set:offer});
	ctx.status = 200;
}
