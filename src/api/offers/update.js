var mongo = require("mongodb");
var parse = require("co-body");

module.exports = async function(ctx){
	var offer = await parse.json(ctx);
	await ctx.app.db.Offer.update({_id:mongo.ObjectID(ctx.params.offer)},{$set:offer});
	ctx.status = 200;
}
