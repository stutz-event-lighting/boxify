var get = require("./get_mw.js");
module.exports = function(req,res){
    get(req,res,function(){
        req.app.db.collection("users").findOne({_id:req.session.user},{firstname:true,lastname:true},function(err,user){
            if(err || !user) return this.fail();
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            req.session.user = user;
            res.end(JSON.stringify(req.session));
        });
    })
}
