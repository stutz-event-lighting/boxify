var mongo = require("mongodb");

module.exports = function(req,res){
    var store = new mongo.GridStore(req.app.db,parseFloat(req.params.type),"r",{root:"equipmentimages"});
    store.open(function(err){
        if(err) return res.fail();
        store.read(function(err,data){
            store.close(function(err2){
                if(err || err2) return res.fail();
                res.writeHead(200,"OK",{"Content-Type","image/jpeg"});
                res.end(data);
            });
        })
    })
}
