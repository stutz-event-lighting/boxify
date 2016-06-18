var mongo = require("mongodb");

module.exports = function*(){
    if(this.params.contact == "own"){
        this.status = 301;
        this.set("Location","/public/logo.png");
        return;
    }

    var select = {_id:parseFloat(this.params.contact)};
    if(this.params.contact != this.session.user+""&&this.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(this.session.permissions.indexOf("users_read")>=0) roles.push("user");
        if(this.session.permissions.indexOf("customers_read")>=0) roles.push("customer");
        if(this.session.permissions.indexOf("suppliers_read")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };

    var contact = yield this.app.db.Contact.findOne(select);
    try{
        var store = new mongo.GridStore(this.app.db,parseFloat(this.params.contact),"","r",{root:"contacts"});
        yield store.open();
        this.set("Content-Type","image/jpeg");
        this.body = yield store.read();
        yield store.close();
    }catch(e){
        this.set("Location","http://placehold.it/350x250");
        this.status = 302;
    }
}
