var mongo = require("mongodb");

module.exports = async function(ctx){
	await ctx.app.db.Offer.remove({_id:mongo.ObjectID(ctx.params.offer)});
	ctx.status = 200;
}
