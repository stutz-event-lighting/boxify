var mongo = require("mongodb");
module.exports = async function(ctx){
	var offer = await ctx.app.db.Offer.findOne({_id:mongo.ObjectID(ctx.params.offer)}).select("project location date expiration person user projects discounts");
	if(offer == null) ctx.throw(404);
	ctx.set("Content-Type","application/json");
	ctx.body = JSON.stringify(offer);
}
