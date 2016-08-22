var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw");

router
.get("/create",ensurePermission("projects_write"),require("./create"))
.get("/:reservation",ensurePermission("projects_read"),require("./get"))
.post("/:reservation",ensurePermission("projects_write"),require("./update"))
.get("/:reservation/delete",ensurePermission("projects_write"),require("./delete"));

module.exports = function*(next){
    var prev = this.path;
    this.path = this.path.slice(("/"+this.params.project+"/reservations").length);
    yield router.routes();
    this.path = prev;
    yield next;
}
