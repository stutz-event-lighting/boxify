module.exports = async function(ctx){
    await ctx.app.db.Session.remove({_id:ctx.cookies.get("session")});
    ctx.status = 200;
}
