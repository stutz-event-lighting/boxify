module.exports = function(req,res){
    var regex = {$regex:"^"+req.body.tag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"}
    req.app.db.collection("equipmenttags").find({_id:regex},{_id:true}).toArray(function(err,tags){
        if(err) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        var tags = JSON.stringify(tags.map(function(tag){
            return tag._id;
        }));
        res.end(tags);
    });
}
