var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    await ctx.app.db.Contact.update({_id:parseFloat(body.contact)},{$addToSet:{roles:"supplier"}});
    ctx.status = 200;
}
