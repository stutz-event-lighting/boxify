module.exports = function(req,res){
    var id = parseInt(req.params.type,10);
    req.app.db.collection("equipment").find({type:id},{id:true,name:true}).toArray(function(err,stock){
        if(err) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(stock));
    })
}
