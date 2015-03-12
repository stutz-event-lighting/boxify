module.exports = function(req,res){
    req.app.db.collection("users").find({},{username:true,permissions:true,lastaccess:true}).toArray(function(err,users){
        if(err) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(users));
    });
}
