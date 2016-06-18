var router = require("koa-router")();

var ensurePermission = require("../sessions/ensure_mw.js");

module.exports = router
    .post("",ensurePermission("projects_read"),require("./find.js"))
    .post("/create",ensurePermission("projects_write"),require("./create.js"))
    .get("/:id",ensurePermission("projects_read"),require("./get.js"))
    .post("/:id",ensurePermission("projects_write"),require("./update.js"))
    .get("/:id/finish",ensurePermission("projects_write"),require("./finish.js"))
    .get("/:id/delete",ensurePermission("projects_write"),require("./delete.js"))
    .all("/:project/reservations",require("./reservations"))
    .routes();
