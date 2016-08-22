var router = require("koa-router")();

var ensurePermission = require("../sessions/ensure_mw");

module.exports = router
    .post("",ensurePermission("projects_read"),require("./find"))
    .post("/create",ensurePermission("projects_write"),require("./create"))
    .get("/:id",ensurePermission("projects_read"),require("./get"))
    .post("/:id",ensurePermission("projects_write"),require("./update"))
    .get("/:id/finish",ensurePermission("projects_write"),require("./finish"))
    .get("/:id/delete",ensurePermission("projects_write"),require("./delete"))
    .all("/:project/reservations/*",require("./reservations"))
    .routes();
