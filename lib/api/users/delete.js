module.exports = function*(){
    var id = parseFloat(this.params.user);
    if(this.session.user != id && this.session.permissions.indexOf("users_write") < 0) this.throw(403);
    yield [
        this.app.db.Contact.update({_id:id},{$pull:{roles:"user"}}),
        this.app.db.Session.remove({user:id})
    ]
    this.status = 200;
}
