var mongo = require("mongodb");
var util = require("../../util");
var calcNeeded = require("./calculateneeded");

module.exports = async function(ctx){
    var id = mongo.ObjectID(ctx.params.id);
    var results = await Promise.all([
        ctx.app.db.Project.findOne({_id:id}).select("name customer start end balance remark status projectNumber"),
        ctx.app.db.EquipmentReservation.find({project:id}).select("items"),
        calcNeeded(ctx.app.db,id),
        ctx.app.db.EquipmentIo.find({project:id}).select("type time items user draft").populate("user","firstname lastname").sort({time:1})
    ])
    var reservations = JSON.parse(JSON.stringify(results[1]));
    for(var i = 0; i < reservations.length; i++){
        var reservation = reservations[i];
        reservation.count = Object.keys(reservation.items).length;
        reservation.total = Object.keys(reservation.items).map(function(type){return reservation.items[type]}).concat([0]).reduce(function(prev,val){return prev+val});
        delete reservation.items;
    }

    var needed = results[2];
    var needsRental = false;
    for(var type in needed){
        if(needed[type] > 0){
            needsRental = true;
            break;
        }
    }

    var ios = JSON.parse(JSON.stringify(results[3]));
    for(var i = 0; i < ios.length; i++){
        var io = ios[i];
        io.count = Object.keys(io.items).length;
        io.total = Object.keys(io.items).map(function(type){return io.items[type].count}).concat([0]).reduce(function(prev,val){return prev+val});
        delete io.items;
    }

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify({
        project:results[0],
        reservations:reservations,
        needsRental:needsRental,
        io:ios
    });
}
