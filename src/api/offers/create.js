var parse = require("co-body");
var mongo = require("mongodb");

module.exports = async function(ctx){
	var offer = await parse.json(ctx);
	offer._id = new mongo.ObjectID();
	await ctx.app.db.Offer.create(offer);
	ctx.body = offer._id+"";
}
