module.exports = async function(ctx){
    var id = parseFloat(ctx.params.id);
    await ctx.app.db.Contact.update({_id:id},{$pull:{roles:"customer"}});
    ctx.status = 200;
}
