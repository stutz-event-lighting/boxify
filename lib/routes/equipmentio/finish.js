var mongo = require("mongodb");
var async = require("async");

var calcBalance = require("../projects/calculatebalance.js");
var calcReservations = require("../projects/calculatereserved.js");

module.exports = function*(){
    var io = yield this.app.db.EquipmentIo.findOne({_id:mongo.ObjectID(this.params.io)}).select("project items reservation history");
    if(io.reservation){
        var reservation = yield this.app.db.EquipmentReservation.findOne({_id:io.reservation}).select("items")

        for(var type in reservation.items){
            if(io.items[type]) reservation.items[type] -= (io.items[type].count||0);
            if(reservation.items[type] <= 0) delete reservation.items[type];
        }
        if(Object.keys(reservation.items).length){
            yield this.app.db.EquipmentReservation.update({_id:io.reservation},{$set:{items:reservation.items}});
        }else{
            yield this.app.db.EquipmentReservation.remove({_id:io.reservation});
        }
    }
    yield io.history.map(function*(entry){
        if(io.type != "checkout") return;
        var query = {};

        if(entry.source){
            query.id = entry.source.item;
            query.type = entry.source.type;
        }else{
            var id = Object.keys(entry.items)[0];
            query["contents."+entry.type+".ids"] = id;
        }

        var item = yield this.app.db.EquipmentItem.findOne(query).select("contents");
        if(item.contents[entry.type].count - entry.count > 0){
            var op = {$inc:{}};
            op.$inc["contents."+entry.type+".count"] = -entry.count;
            if(id){
                op.$pull = {};
                op.$pull["contents."+entry.type+".ids"] = id;
            }
        }else{
            var op = {$unset:{}}
            op.$unset["contents."+entry.type] = true;
        }
        yield this.app.db.EquipmentItem.update(query,op);
    }.bind(this));

    yield this.app.db.EquipmentIo.update({_id:io._id},{$set:{user:this.session.user,time:new Date().getTime()},$unset:{draft:true,reservation:true}});

    yield [
        calcBalance(this.app.db,io.project),
        calcReservations(this.app.db,io.project)
    ];

    this.status = 200;
}
