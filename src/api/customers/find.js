var findContact = require("../contacts/find");

module.exports = async function(ctx){
    await findContact(ctx,"customer");
}
