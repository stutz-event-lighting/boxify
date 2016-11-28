var parse = require("co-body");
var mongo = require("mongodb");

module.exports = async function(ctx){
	var offer = await parse.json(ctx);
	offer._id = new mongo.ObjectID();
	offer.project = mongo.ObjectID(offer.project);
	for(var project of offer.projects){
		for(var item of project.items){
			if(item.type) item.type = parseFloat(item.type);
			if(item.category) item.category = mongo.ObjectID(item.category)
		}
	}

	await ctx.app.db.Offer.create(offer);
	ctx.body = offer._id+"";
}
