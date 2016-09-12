module.exports = async function(ctx){
    var id = parseFloat(ctx.params.id);
    await ctx.app.db.Contact.update({_id:id},{$pull:{roles:"supplier"}});
    ctx.status = 200;
}
