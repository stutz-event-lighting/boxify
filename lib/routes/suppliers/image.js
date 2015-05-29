var mongo = require("mongodb");

module.exports = function(req,res){
    if(req.params.id == "own"){
        res.writeHead(301,"Moved Permanently",{Location:"/public/logo.png"})
        return res.end();
    }
    var store = new mongo.GridStore(req.app.db,parseFloat(req.params.id),parseFloat(req.params.id),"r",{root:"contacts"});
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

    function fail(){
        res.writeHead(302,"OK",{"Location":"http://placehold.it/350x250"});
        res.end();
    }
}
