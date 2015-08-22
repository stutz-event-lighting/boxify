var mongo = require("mongodb");
module.exports = function(req,res){
    var select = {_id:mongo.ObjectID(req.params.contact)};
    if(req.params.contact != req.session.user+"" && req.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(req.session.permissions.indexOf("users_read")>=0) roles.push("user");
        if(req.session.permissions.indexOf("customers_read")>=0) roles.push("customer");
        if(req.session.permissions.indexOf("suppliers_read")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };
    req.app.db.collection("contacts").findOne(select,{
        type:true,
        salutation:true,
        firstname:true,
        lastname:true,
        streetName:true,
        streetNr:true,
        zip:true,
        city:true,
        emails:true,
        phones:true,
        comment:true
    },function(err,contact){
        if(err || !contact) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(contact));
    });
}