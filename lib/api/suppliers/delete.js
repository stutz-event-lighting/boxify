module.exports = function*(){
    var id = parseFloat(this.params.id);
    yield this.app.db.Contact.update({_id:id},{$pull:{roles:"supplier"}});
    this.status = 200;
}
