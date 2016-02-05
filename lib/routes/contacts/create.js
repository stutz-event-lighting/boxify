module.exports = function(req,res){
    var contact = {};
    var types = ["person","company","club"];
    if(types.indexOf(req.body.type) < 0) req.body.type = "person";
    contact.type = req.body.type;

    if(typeof req.body.firstname == "string" && req.body.firstname.length){
        contact.firstname = req.body.firstname;
    }

    if(req.body.type == "person" && typeof req.body.lastname == "string" && req.body.lastname.length){
        contact.lastname = req.body.lastname;
    }

    contact.emails = [];
    contact.phones = [];
    contact.contacts = [];

    req.app.db.collection("settings").findAndModify(
        {_id:"nextContactID"},
        null,
        {$inc:{value:1}},
        {fields:{value:true}},
        function(err,item){
            if(err) return res.fail();
            contact._id = item.value;
            req.app.db.collection("contacts").insert(contact,function(err,info){
                if(err) return res.fail();
                res.end(info[0]._id+"");
            });
        }
    );
}
