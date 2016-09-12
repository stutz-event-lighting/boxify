var mongo = require("mongodb");
var util = require("../../util");
var calcBalance = require("../equipment/calculatebalance");

module.exports = function*(){
    var results = yield [
        this.app.db.EquipmentCategory.find({}).select("name"),
        this.app.db.EquipmentType.find({}).select("name category"),
        calcBalance(this.app.db),
        this.app.db.EquipmentIo.findOne({_id:mongo.ObjectID(this.params.io)}).select("person project items history draft reservation").populate("project","balance").populate("reservation","items")
    ];
    var categories = util.createIndex(results[0],"_id");
    var types = util.createIndex(JSON.parse(JSON.stringify(results[1])),"_id");
    var balance = results[2];
    var checkout = results[3];
    var items = checkout.items;
    var history = checkout.history;
    var project = checkout.project;
    var reservation = checkout.reservation;
    checkout.project = checkout.project._id;
    if(checkout.reservation) checkout.reservation = checkout.reservation._id;

    for(var type in types){
        if(balance[type]){
            types[type].available = balance[type].count;
            types[type].suppliers = {};
            for(var supplier in balance[type].suppliers){
                types[type].suppliers[supplier] = {available:balance[type].suppliers[supplier]}
            }
        }
        if(items && items[type]){
            types[type].count = items[type].count;
            types[type].available = (types[type].available||0)+cap(types[type].count,project.balance[type]?project.balance[type].count:0);
            if(!types[type].suppliers) types[type].suppliers = {};
            for(var supplier in items[type].suppliers){
                if(!types[type].suppliers[supplier]) types[type].suppliers[supplier] = {available:0}
                types[type].suppliers[supplier].count = items[type].suppliers[supplier].count;
                types[type].suppliers[supplier].available += cap(items[type].suppliers[supplier].count,(project.balance[type]&&project.balance[type].suppliers[supplier])?-project.balance[type].suppliers[supplier]:0);
                types[type].suppliers[supplier].ids = items[type].suppliers[supplier].ids;
            }
        }
        if(reservation && reservation.items[type]){
            types[type].needed = reservation.items[type];
        }
    }

    this.set("Content-Type","application/json");
    this.body = JSON.stringify({
        person:checkout.person,
        draft:checkout.draft,
        categories:categories,
        types:types,
        history:history
    });
}

function cap(x,y){
    return x;
    if(x < y) return x;
    return y;
}
