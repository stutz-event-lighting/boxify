var parse = require("co-body");

module.exports = function*(){

    var body = yield parse.json(this);
    console.log(body);
    var query = {$set:{},$unset:{}};

    var types = ["person","company","club"];
    if(types.indexOf(body.type) < 0) body.type = "person";
    query.$set.type = body.type;

    if(body.type == "person" && typeof body.salutation == "string" && body.salutation.length){
        query.$set.salutation = body.salutation;
    }else{
        query.$unset.salutation = true;
    }
    if(typeof body.firstname == "string" && body.firstname.length){
        query.$set.firstname = body.firstname;
    }else{
        query.$unset.firstname = true;
    }
    if(body.type == "person" && typeof body.lastname == "string" && body.lastname.length){
        query.$set.lastname = body.lastname;
    }else{
        query.$unset.lastname = true;
    }
    if(typeof body.streetName == "string" && body.streetName.length){
        query.$set.streetName = body.streetName;
    }else{
        query.$unset.streetName = true;
    }
    if(typeof body.streetNr == "string" && body.streetNr.length){
        query.$set.streetNr = body.streetNr;
    }else{
        query.$unset.streetNr = true;
    }
    if(typeof body.zip == "string" && body.zip.length){
        query.$set.zip = body.zip;
    }else{
        query.$unset.zip = true;
    }
    if(typeof body.city == "string" && body.city.length){
        query.$set.city = body.city;
    }else{
        query.$unset.city = true;
    }
    if(typeof body.remark == "string" && body.remark.length){
        query.$set.remark = body.remark;
    }else{
        query.$unset.remarks = true;
    }

    var emails = [];
    if(!(body.emails instanceof Array)) body.emails = [];
    for(var i = 0; i < body.emails.length; i++){
        var email = body.emails[i];
        var entry = {};
        entry.type = typeof email.type == "string"?email.type:"";
        entry.email = typeof email.email == "string"?email.email:"";
        if(email.standard) entry.standard = true;

        emails.push(entry);
    }
    query.$set.emails = emails;

    var phones = [];
    if(!(body.phones instanceof Array)) body.phones = [];
    for(var i = 0; i < body.phones.length; i++){
        var phone = body.phones[i];
        var entry = {};
        entry.type = typeof phone.type == "string"?phone.type:"";
        entry.number = typeof phone.number == "string"?phone.number:"";
        if(phone.standard) entry.standard = true;

        phones.push(entry);
    }
    query.$set.phones = phones;

    if((body.type == "company" || body.type == "club") && body.contacts instanceof Array){
        var contacts = [];
        for(var i = 0; i < body.contacts.length; i++){
            var contact = body.contacts[i];
            contacts.push({_id:contact.id,type:contact.type});
        }
        query.$set.contacts = contacts;
    }else{
        query.$unset.contacts = true;
    }

    if(!Object.keys(query.$unset).length) delete query.$unset;

    var select = {_id:parseFloat(this.params.contact)};
    if(this.params.contact != this.session.user+""&&this.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(this.session.permissions.indexOf("users_write")>=0) roles.push("user");
        if(this.session.permissions.indexOf("customers_write")>=0) roles.push("customer");
        if(this.session.permissions.indexOf("suppliers_write")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    }
    console.log(JSON.stringify(query,null,"\t"));
    yield this.app.db.Contact.update(select,query,{upsert:true});
    this.status = 200;
}
