var get = require("./get_mw");
var compose = require("koa-compose");
module.exports = compose([
    get,
    function*(){
        var user = yield this.app.db.Contact.findOne({_id:this.session.user}).select("firstname lastname");
        this.set("Content-Type","application/json");
        this.body = JSON.stringify({_id:this.session.id,permissions:this.session.permissions,user:user});
    }
]);
