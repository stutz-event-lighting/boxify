var router = require("koa-router")();
var ensurePermission = require("../sessions/ensure_mw.js");

module.exports = router
    .post("",ensurePermission("rentals_read"),require("./find.js"))
    .get("/:rental",ensurePermission("rentals_read"),require("./get.js"))
    .post("/:rental",ensurePermission("rentals_write"),require("./update.js"))
    .post("/:rental/updatestatus",ensurePermission("rentals_write"),require("./updatestatus.js"))
    .get("/:rental/delete",ensurePermission("rentals_write"),require("./delete.js"))
    .routes();
