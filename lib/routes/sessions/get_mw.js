var get = require("./get.js");

module.exports = function*(next){
    var session = yield get(this.app.db,this.cookies.get("session"));
    if(!session) this.throw(403);
    this.session = session;
    yield next;
}
