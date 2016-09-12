var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);

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

    var settings = await ctx.app.db.MainSettings.findByIdAndUpdate("main",{$inc:{nextContactId:1}},{select:"nextContactId"});
    contact._id = settings.nextContactId||0;

    await ctx.app.db.Contact.create(contact);
    ctx.body = contact._id+"";
}
