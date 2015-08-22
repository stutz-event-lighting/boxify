var mongo = require("mongodb");

module.exports = function(req,res){
    var query = {};
    query["contents."+req.params.type+".ids"] = parseInt(req.params.item,10);
    req.app.db.collection("equipment").findOne(query,{},function(err,item){
        if(err) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(item?(item._id+""):"null");
    })
}
