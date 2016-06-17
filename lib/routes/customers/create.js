var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    yield this.app.db.Contact.update({_id:parseFloat(body.contact)},{$addToSet:{roles:"customer"}});
    this.status = 200;
}
