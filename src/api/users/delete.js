module.exports = async function(ctx){
    var id = parseFloat(ctx.params.user);
    if(ctx.session.user != id && ctx.session.permissions.indexOf("users_write") < 0) ctx.throw(403);
    await Promise.all([
        ctx.app.db.Contact.update({_id:id},{$pull:{roles:"user"}}),
        ctx.app.db.Session.remove({user:id})
    ])
    ctx.status = 200;
}
