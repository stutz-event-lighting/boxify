var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw.js");

module.exports = router
    .post("",ensurePermission("projects_write"),require("./create.js"))
    .get("/:io/checkout",ensurePermission("projects_read"),require("./checkout.js"))
    .get("/:io/checkin",ensurePermission("projects_read"),require("./checkin.js"))
    .post("/:io",ensurePermission("projects_write"),require("./update.js"))
    .get("/:io/finish",ensurePermission("projects_write"),require("./finish.js"))
    .get("/:io/pickupConfirmation.docx",ensurePermission("projects_read"),require("./pickupConfirmation.js"))
    .get("/:io/delete",ensurePermission("projects_write"),require("./delete.js"))
    .routes();
