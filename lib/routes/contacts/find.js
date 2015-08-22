module.exports = function(req,res){
    var query = {};
    if(req.body.search){
        var words = req.body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/\s\s+/g," ").split(" ");
        var needed = [];
        for(var i = 0; i < words.length; i++){
            needed.push({
                $or:[
                    {firstname:{$regex:words[i],$options:"i"}},
                    {lastname:{$regex:words[i],$options:"i"}}
                ]
            })
        }
        if(needed.length){
            query.$and = needed;
        }
    }
    if(req.body.role){
        query.roles = req.body.role;
    }
    req.app.db.collection("contacts").find(query,{_id:true,firstname:true,lastname:true}).toArray(function(err,items){
        if(err) return res.fail(err);
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(items));
    });
}
