var react = require("react");
var Select = require("./select");
var client = require("../client");

module.exports = class ContactBox extends Select{
    async getLabel(contact){
        var contact = await client.getContact(contact);
        return (contact.firstname?contact.firstname+" ":"")+(contact.lastname||"");
    }

    async getOptions(input){
        if(typeof input == "object") return [];
        var query = {search:input||""};
        if(this.props.role) query.role = this.props.role;
        if(this.props.type) query.type = this.props.type;

        var contacts = await client.findContacts(query);
        return contacts.map((contact)=>({value:contact._id,label:(contact.firstname?contact.firstname+" ":"")+(contact.lastname||"")}));
    }
}
