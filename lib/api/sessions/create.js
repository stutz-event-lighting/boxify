var crypto = require("crypto");
var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);
    if(body.email && body.password){
        var query = {"emails.email":body.email,password:body.password};
    }else if(body.pin){
        var query = {pin:body.pin}
    }else{
        return res.fail();
    }
    var user = yield this.app.db.Contact.findOne(query).select("firstname lastname permissions");

    var sessionid = crypto.randomBytes(16).toString("hex");
    var session = yield this.app.db.Session.create({_id:sessionid,user:user._id,permissions:user.permissions});
    this.set("Content-Type","application/json");
    this.body = JSON.stringify({_id:sessionid,user:user,permissions:user.permissions});
}
