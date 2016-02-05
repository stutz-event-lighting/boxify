var mongo = require("mongodb");

module.exports = function(req,res){
    if(req.params.contact == "own"){
        res.writeHead(301,"Moved Permanently",{Location:"/public/logo.png"})
        return res.end();
    }

    var select = {_id:parseFloat(req.params.contact)};
    if(req.params.contact != req.session.user+""&&req.session.permissions.indexOf("contacts_write") < 0){
        var roles = [];
        if(req.session.permissions.indexOf("users_read")>=0) roles.push("user");
        if(req.session.permissions.indexOf("customers_read")>=0) roles.push("customer");
        if(req.session.permissions.indexOf("suppliers_read")>=0) roles.push("supplier");
        if(roles.length) select.roles = {$in:roles};
    };

    req.app.db.collection("contacts").find(select,{},function(err,contact){
        if(err || !contact) return res.fail();
        var store = new mongo.GridStore(req.app.db,parseFloat(req.params.contact),"","r",{root:"contacts"});
        store.open(function(err,a){
            if(err) return fail();
            store.read(function(err,data){
                if(err) return fail();
                store.close(function(err2){
                    if(err) return fail();
                    res.writeHead(200,"OK",{"Content-Type":"image/jpeg"});
                    res.end(data);
                });
            });
        })
    })

    function fail(){
        res.writeHead(302,"OK",{"Location":"http://placehold.it/350x250"});
        res.end();
    }
}
