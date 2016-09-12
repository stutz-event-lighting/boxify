var mongo = require("mongodb");

module.exports = async function(ctx){
    var store = new mongo.GridStore(ctx.app.db,parseFloat(ctx.params.id),parseFloat(ctx.params.id),"r",{root:"equipmentimages"});
    try{
        await store.open();
        var data = await store.read();
        await store.close();
    }catch(e){
        ctx.status = 302;
        ctx.set("Location","http://placehold.it/350x250");
        return;
    }
    ctx.set("Content-Type","image/jpeg");
    ctx.body = data;
}
