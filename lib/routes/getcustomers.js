module.exports = function(req,res){
    var query = {};
    if(req.body.search){
        query.name = {$regex:"^"+req.body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"};
    }
    req.app.db.collection("customers").find(query,{_id:true,name:true}).toArray(function(err,items){
        if(err) return res.fail(err);
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(items));
    });
}
