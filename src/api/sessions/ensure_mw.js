var ensure = require("./ensure");

module.exports = function(permission){
    return function*(next){
        this.session = yield ensure(this.app.db,this.cookies.get("session"),permission);;
        yield next;
    }
}
