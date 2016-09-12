var mongo = require("mongodb");
var util = require("../../util");

module.exports = async function(ctx){
    var results = await Promise.all([
        ctx.app.db.EquipmentType.find({}).select("name hasItems contents"),
        ctx.app.db.EquipmentIo.findOne({_id:mongo.ObjectID(ctx.params.io)}).select("person project items history draft").populate("project","balance")
    ])
    var types = util.createIndex(JSON.parse(JSON.stringify(results[0])),"_id");
    var checkin = results[1];
    var items = checkin.items;
    var history = checkin.history;

    var balance = checkin.project.balance;
    checkin.project = checkin.project._id;

    for(var type in types){
        if(balance[type]){
            types[type].available = -balance[type].count;
            types[type].suppliers = {};
            for(var supplier in balance[type].suppliers){
                types[type].suppliers[supplier] = {available:-balance[type].suppliers[supplier]}
            }
        }
        if(items && items[type]){
            types[type].count = items[type].count;
            types[type].available = (types[type].available||0)+types[type].count;
            if(!types[type].suppliers) types[type].suppliers = {};
            for(var supplier in items[type].suppliers){
                if(!types[type].suppliers[supplier]) types[type].suppliers[supplier] = {available:0};
                types[type].suppliers[supplier].count = items[type].suppliers[supplier].count;
                types[type].suppliers[supplier].available += items[type].suppliers[supplier].count;
                types[type].suppliers[supplier].ids = items[type].suppliers[supplier].ids;
            }
        }
    }
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify({
        person:checkin.person,
        draft:checkin.draft,
        types:types,
        history:history
    });
}
