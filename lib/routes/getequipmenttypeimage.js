var mongo = require("mongodb");

module.exports = function(req,res){
    var store = new mongo.GridStore(req.app.db,parseFloat(req.params.id),parseFloat(req.params.id),"r",{root:"equipmentimages"});
    store.open(function(err,a){
        if(err) {
            res.writeHead(302,"OK",{"Location":"http://placehold.it/350x350"});
            res.end();
            return;
        }
        store.read(function(err,data){
            if(err){
                res.writeHead(302,"OK",{"Location":"http://placehold.it/350x350"});
                res.end();
            }
            store.close(function(err2){
                if(err) {
                    res.writeHead(302,"OK",{"Location":"http://placehold.it/350x350"});
                    res.end();
                }
                res.writeHead(200,"OK",{"Content-Type":"image/jpeg"});
                res.end(data);
            });
        });
    })
}
