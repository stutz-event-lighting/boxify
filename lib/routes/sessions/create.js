var crypto = require("crypto");

module.exports = function(req,res){
    if(req.body.email && req.body.password){
        var query = {"emails.email":req.body.email,password:req.body.password};
    }else if(req.body.pin){
        var query = {pin:req.body.pin}
    }else{
        return res.fail();
    }

    req.app.db.collection("contacts").findOne(query,{firstname:true,lastname:true,permissions:true},function(err,user){
        if(err || !user) return res.fail();
        var sessionid = crypto.randomBytes(16).toString("hex");
        req.app.db.collection("sessions").insert({_id:sessionid,user:user._id,permissions:user.permissions},function(err){
            if(err) return res.fail();
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify({_id:sessionid,user:user,permissions:user.permissions}));
        });
    });
}
