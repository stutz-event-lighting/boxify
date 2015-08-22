var findContact = require("../contacts/find.js");

module.exports = function(req,res){
    req.body.role = "customer";
    findContact(req,res);
}
