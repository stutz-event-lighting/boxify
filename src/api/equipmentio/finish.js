var mongo = require("mongodb");

var calcBalance = require("../projects/calculatebalance");
var calcReservations = require("../projects/calculatereserved");

module.exports = async function(ctx){
    var io = await ctx.app.db.EquipmentIo.findOne({_id:mongo.ObjectID(ctx.params.io)}).select("project items reservation history");
    if(io.reservation){
        var reservation = await ctx.app.db.EquipmentReservation.findOne({_id:io.reservation}).select("items")

        for(var type in reservation.items){
            if(io.items[type]) reservation.items[type] -= (io.items[type].count||0);
            if(reservation.items[type] <= 0) delete reservation.items[type];
        }
        if(Object.keys(reservation.items).length){
            await ctx.app.db.EquipmentReservation.update({_id:io.reservation},{$set:{items:reservation.items}});
        }else{
            await ctx.app.db.EquipmentReservation.remove({_id:io.reservation});
        }
    }
    await Promise.all(io.history.map(async function(entry){
        if(io.type != "checkout") return;
        var query = {};

        if(entry.source){
            query.id = entry.source.item;
            query.type = entry.source.type;
        }else{
            var id = Object.keys(entry.items)[0];
            query["contents."+entry.type+".ids"] = id;
        }

        var item = await ctx.app.db.EquipmentItem.findOne(query).select("contents");
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
        await ctx.app.db.EquipmentItem.update(query,op);
    }));

    await ctx.app.db.EquipmentIo.update({_id:io._id},{$set:{user:ctx.session.user,time:new Date().getTime()},$unset:{draft:true,reservation:true}});

    await Promise.all([
        calcBalance(ctx.app.db,io.project),
        calcReservations(ctx.app.db,io.project)
    ]);

    ctx.status = 200;
}
