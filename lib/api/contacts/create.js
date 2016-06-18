var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);

    var contact = {};
    var types = ["person","company","club"];
    if(types.indexOf(body.type) < 0) body.type = "person";
    contact.type = body.type;

    if(typeof body.firstname == "string" && body.firstname.length){
        contact.firstname = body.firstname;
    }

    if(body.type == "person" && typeof body.lastname == "string" && body.lastname.length){
        contact.lastname = body.lastname;
    }

    contact.emails = [];
    contact.phones = [];
    contact.contacts = [];

    var settings = yield this.app.db.MainSettings.findByIdAndUpdate("main",{$inc:{nextContactId:1}},{select:"nextContactId"});
    contact._id = settings.nextContactId||0;

    yield this.app.db.Contact.create(contact);
    this.body = contact._id+"";
}
