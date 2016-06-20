var findContact = require("../contacts/find");

module.exports = function*(){
    yield findContact.call(this,"customer");
}
