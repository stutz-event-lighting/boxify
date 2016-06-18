var router = require("koa-router")();
var ensurePermission = require("../../sessions/ensure_mw.js");

router
.get("/create",ensurePermission("projects_write"),require("./create.js"))
.get("/:reservation",ensurePermission("projects_read"),require("./get.js"))
.post("/:reservation",ensurePermission("projects_write"),require("./update.js"))
.get("/:reservation/delete",ensurePermission("projects_write"),require("./delete.js"));

module.exports = function*(next){
    var prev = this.path;
    this.path = this.path.slice(("/"+this.params.project+"/reservations").length);
    yield router;
    this.path = prev;
    yield next;
}
