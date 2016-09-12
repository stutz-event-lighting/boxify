var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    await ctx.app.db.Contact.update({_id:parseFloat(body.contact)},{$set:{permissions:[]},$addToSet:{roles:"user"}});
    ctx.status = 200;
}
