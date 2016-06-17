module.exports = function*(){
    yield this.app.db.Session.remove({_id:this.cookies.get("session")});
    this.status = 200;
}
