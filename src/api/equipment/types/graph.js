var mongo = require("mongodb");

module.exports = function*(){
    var type = parseInt(this.params.type,10);
    var results = yield [
        this.app.db.EquipmentLog.find({type:type,event:{$in:["added","removed"]}}).select("time count id event").sort({time:-1}),
        function*(){
            var query = {draft:{$ne:true}};
            query["items."+type] = {$exists:true};
            return yield this.app.db.EquipmentIo.find(query).select("project type time items").sort({time:-1})
        }.bind(this),
        function*(){
            var query = {};
            query["items."+type] = {$exists:true};
            return yield this.app.db.EquipmentReservation.find(query).select("project status delivery return items").sort({delivery:-1})
        }.bind(this),
        function*(){
            var query = {};
            query["items."+type] = {$exists:true};
            return yield this.app.db.EquipmentRental.find(query).select("status delivery return items").sort({delivery:-1})
        }
    ]

    var logs = results[0];
    var ios = results[1];
    var reservations = results[2];
    var rentals = results[3];

    var supplies = [];
    var demands = [];

    for(var i = 0; i < logs.length; i++){
        var log = logs[i];
        supplies.push({time:log.time,count:(log.count||1)*(log.event=="added"?1:-1)})
    }

    var iosbyproject = {};
    for(var i = 0; i < ios.length; i++){
        var io = ios[i];
        if(!iosbyproject[io.project+""]) iosbyproject[io.project+""] = [];
        iosbyproject[io.project+""].push(io);
        demands.push({time:io.time,count:io.items[type].count*(io.type=="checkin"?-1:1)});
    }

    var reservationsbyproject = {};
    for(var i = 0; i < reservations.length; i++){
        var reservation = reservations[i];
        if(!reservationsbyproject[reservation.project+""]) reservationsbyproject[reservation.project+""] = [];
        reservationsbyproject[reservation.project+""].push(reservation);
    }

    for(var i = 0; i < rentals.length; i++){
        var rental = rentals[i];
        supplies.push({time:rental.delivery,count:rental.items[type].count,rented:true});
        supplies.push({time:rental.return,count:-rental.items[type].count,rented:true});
    }

    var projects = {};
    Object.keys(iosbyproject).concat(Object.keys(reservationsbyproject)).forEach(function(entry){projects[entry] = true});
    projects = Object.keys(projects).map(function(project){return mongo.ObjectID(project)});

    var projects = yield this.app.db.Project.find({_id:{$in:projects}}).select("start end balance");

    for(var i = 0; i < projects.length; i++){
        var p = projects[i];
        if(p.balance[type]) demands.push({time:p.end,count:p.balance[type].count});

        var reservations = reservationsbyproject[p._id+""]||[];
        for(var j = 0; j < reservations.length; j++){
            var r = reservations[j];
            demands.push({time:p.start,count:r.items[type]});
            demands.push({time:p.end,count:-r.items[type]});
        }
    }
    supplies.sort(function(a,b){return a.time - b.time});
    demands.sort(function(a,b){return a.time - b.time});

    var currentsupply = 0;
    var currentownsupply = 0;
    var supplytimeline = {0:0};
    var ownsupplytimeline = {0:0}

    for(var i = 0; i < supplies.length; i++){
        var supply = supplies[i];
        currentsupply += supply.count;
        if(!supply.rented) currentownsupply += supply.count;
        supplytimeline[supply.time] = currentsupply;
        ownsupplytimeline[supply.time] = currentownsupply;
    }

    var currentdemand = 0;
    var demandtimeline = {0:0};
    for(var i = 0; i < demands.length; i++){
        var demand = demands[i];
        demandtimeline[demand.time] = currentdemand += demand.count;
    }

    this.set("Content-Type","application/json");
    this.body = JSON.stringify({supply:supplytimeline,ownsupply:ownsupplytimeline,demand:demandtimeline});
}
