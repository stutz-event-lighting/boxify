module.exports = function(req,res){
    var query = {};
    if(req.body.search){

        var words = req.body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/\s\s+/g," ").split(" ");
        var needed = [];
        for(var i = 0; i < words.length; i++){
            needed.push({
                $or:[
                    {name:{$regex:words[i],$options:"i"}},
                    {manufacturer:{$regex:words[i],$options:"i"}},
                    {tags:{$regex:words[i],$options:"i"}}
                ]
            })
        }
        if(needed.length){
            query.$and = needed;
        }
    }
    req.app.db.collection("equipmenttypes").find(query,{_id:true,name:true,manufacturer:true,category:true,count:true,weight:true,height:true,width:true,length:true}).toArray(function(err,items){
        if(err) return res.fail(err);
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(items));
    });
}
