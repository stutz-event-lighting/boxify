var get = require("./get_mw");
var compose = require("koa-compose");
module.exports = compose([
    get,
    async function(ctx){
        var user = await ctx.app.db.Contact.findOne({_id:ctx.session.user}).select("firstname lastname");
        ctx.set("Content-Type","application/json");
        ctx.body = JSON.stringify({_id:ctx.session.id,permissions:ctx.session.permissions,user:user});
    }
]);
