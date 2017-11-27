var mongo = require("mongodb");

module.exports = async function(ctx){

	var query = {};

	if(ctx.query.project) query.project = mongo.ObjectID(ctx.query.project);

	var offers = await ctx.app.db.Offer
        .find(query)
        .select("date person user total expiration")
        .populate("person","firstname lastname")
		.populate("user","firstname lastname")

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(offers);
}
