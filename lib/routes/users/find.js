module.exports = function(req,res){
    var query = [];
    if(req.body && req.body.search){
        var words = req.body.search.replace(/\s\s+/g, ' ').trim().split(" ");
        for(var i = 0; i < words.length; i++){
            var regex = {$regex:"^"+words[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"}
            query.push({$or:[
                {firstname:regex},
                {lastname:regex}
            ]});
        }
    }

    req.app.db.collection("users").find(query.length?{$and:query}:{},{firstname:true,lastname:true,email:true}).toArray(function(err,users){
        if(err) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(users));
    });
}
