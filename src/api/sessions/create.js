var crypto = require("crypto");
var parse = require("co-body");

module.exports = async function(ctx){
    var body = await parse.json(ctx);
    if(body.email && body.password){
        var query = {"emails.email":body.email,password:body.password};
    }else if(body.pin){
        var query = {pin:body.pin}
    }else{
        return res.fail();
    }
    var user = await ctx.app.db.Contact.findOne(query).select("firstname lastname permissions");

    var sessionid = crypto.randomBytes(16).toString("hex");
    var session = await ctx.app.db.Session.create({_id:sessionid,user:user._id,permissions:user.permissions});
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify({_id:sessionid,user:user,permissions:user.permissions});
}
