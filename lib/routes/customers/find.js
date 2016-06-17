var findContact = require("../contacts/find.js");

module.exports = function*(){
    yield findContact.call(this,"customer");
}
