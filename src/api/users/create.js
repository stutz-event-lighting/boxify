var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    yield this.app.db.Contact.update({_id:parseFloat(body.contact)},{$set:{permissions:[]},$addToSet:{roles:"user"}});
    this.status = 200;
}
