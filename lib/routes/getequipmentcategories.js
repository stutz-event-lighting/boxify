module.exports = function(req,res){
    req.app.db.collection("equipmentcategories").find({},{_id:true,name:true}).toArray(function(err,categories){
        if(err) return res.fail();
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(categories));
    })
}
