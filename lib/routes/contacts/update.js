var mongo = require("mongodb");
var async = require("async");
module.exports = function(req,res){

    var query = {$set:{},$unset:{}};

    var types = ["person","company","club"];
    if(types.indexOf(req.body.type) < 0) req.body.type = "person";
    query.$set.type = req.body.type;

    if(req.body.type == "person" && typeof req.body.salutation == "string" && req.body.salutation.length){
        query.$set.salutation = req.body.salutation;
    }else{
        query.$unset.salutation = true;
    }
    if(typeof req.body.firstname == "string" && req.body.firstname.length){
        query.$set.firstname = req.body.firstname;
    }else{
        query.$unset.firstname = true;
    }
    if(req.body.type == "person" && typeof req.body.lastname == "string" && req.body.lastname.length){
        query.$set.lastname = req.body.lastname;
    }else{
        query.$unset.lastname = true;
    }
    if(typeof req.body.streetName == "string" && req.body.streetName.length){
        query.$set.streetName = req.body.streetName;
    }else{
        query.$unset.streetName = true;
    }
    if(typeof req.body.streetNr == "string" && req.body.streetNr.length){
        query.$set.streetNr = req.body.streetNr;
    }else{
        query.$unset.streetNr = true;
    }
    if(typeof req.body.zip == "string" && req.body.zip.length){
        query.$set.zip = req.body.zip;
    }else{
        query.$unset.zip = true;
    }
    if(typeof req.body.city == "string" && req.body.city.length){
        query.$set.city = req.body.city;
    }else{
        query.$unset.city = true;
    }
    if(typeof req.body.comment == "string" && req.body.comment.length){
        query.$set.comment = req.body.comment;
    }else{
        query.$unset.comment = true;
    }

    var emails = [];
    if(!(req.body.emails instanceof Array)) req.body.emails = [];
    for(var i = 0; i < req.body.emails.length; i++){
        var email = req.body.emails[i];
        var entry = {};
        entry.type = typeof email.type == "string"?email.type:"";
        entry.email = typeof email.email == "string"?email.email:"";
        if(email.standard) entry.standard = true;

        emails.push(entry);
    }
    query.$set.emails = emails;

    var phones = [];
    if(!(req.body.phones instanceof Array)) req.body.phones = [];
    for(var i = 0; i < req.body.phones.length; i++){
        var phone = req.body.phones[i];
        var entry = {};
        entry.type = typeof phone.type == "string"?phone.type:"";
        entry.number = typeof phone.number == "string"?phone.number:"";
        if(phone.standard) entry.standard = true;

        phones.push(entry);
    }
    query.$set.phones = phones;

    if(!Object.keys(query.$unset).length) delete query.$unset;

    var select = {_id:mongo.ObjectID(req.params.contact)};
    if(req.params.contact != req.session.user+""&&req.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(req.session.permissions.indexOf("users_write")>=0) roles.push("user");
        if(req.session.permissions.indexOf("customers_write")>=0) roles.push("customer");
        if(req.session.permissions.indexOf("suppliers_write")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    }

    req.app.db.collection("contacts").update(select,query,{upsert:true},function(err){
        if(err) return res.fail();
        res.end();
    });
}