var mongo = require("mongodb");
var async = require("async");
var util = require("../../util");
var calcNeeded = require("./calculateneeded");

module.exports = function*(){
    var id = mongo.ObjectID(this.params.id);
    var results = yield [
        this.app.db.Project.findOne({_id:id}).select("name customer start end balance remark status"),
        this.app.db.EquipmentReservation.find({project:id}).select("items"),
        calcNeeded(this.app.db,id),
        this.app.db.EquipmentIo.find({project:id}).select("type time items user draft").populate("user","firstname lastname").sort({time:1})
    ]
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
    //console.log(needed);

    var ios = JSON.parse(JSON.stringify(results[3]));
    for(var i = 0; i < ios.length; i++){
        var io = ios[i];
        io.count = Object.keys(io.items).length;
        io.total = Object.keys(io.items).map(function(type){return io.items[type].count}).concat([0]).reduce(function(prev,val){return prev+val});
        delete io.items;
    }

    this.set("Content-Type","application/json");
    this.body = JSON.stringify({
        project:results[0],
        reservations:reservations,
        needsRental:needsRental,
        io:ios
    });
}
