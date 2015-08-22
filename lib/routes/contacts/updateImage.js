var mongo = require("mongodb");

module.exports = function(req,res){
    var select = {_id:mongo.ObjectID(req.params.contact)};
    if(req.params.contact != req.session.user+""&&req.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(req.session.permissions.indexOf("users_write")>=0) roles.push("user");
        if(req.session.permissions.indexOf("customers_write")>=0) roles.push("customer");
        if(req.session.permissions.indexOf("suppliers_write")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };

    req.app.db.collection("contacts").findOne(select,{},function(err,contact){
        if(err || !contact) return res.fail();
        var parts = req.body.image.split(",");
        var mime = parts[0].substring(5,parts[0].length-7);
        var data = new Buffer(parts[1],"base64");
        var store = new mongo.GridStore(req.app.db,mongo.ObjectID(req.params.contact),"","w",{root:"contacts",content_type:mime});
        store.open(function(err){
            if(err) return cb(err);
            store.write(data,true,function(err){
                if(err) return res.fail();
                res.end();
            });
        });
    });
}
