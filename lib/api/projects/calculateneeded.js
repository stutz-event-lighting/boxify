var async = require("async");

var calcEquipmentBalance = require("../equipment/calculatebalance");

module.exports = function*(db,project){
    var project = yield db.Project.findOne({_id:project}).select("start end reserved");
    if(!project) throw new Error("Project does not exist");
    var results = yield [
        calcEquipmentBalance(db),
        db.EquipmentRental.find({return:{$gte:project.start},delivery:{$lte:project.end},status:{$in:["requested","booked"]}}).select("delivery return items")
    ];

    var needed = results[0];
    var rentals = results[1];

    for(var type in needed){
        needed[type] = -needed[type].count;
    }

    //create timeline out of all projects
    var timeline = {};
    for(var i = 0; i < rentals.length; i++){
        var rental = rentals[i];
        var start = timeline[rental.delivery];
        if(!start) timeline[rental.delivery] = start = {};
        var end = timeline[rental.return];
        if(!end) timeline[rental.return] = end = {};
        for(var type in rental.items){
            if(start[type] === undefined) start[type] = 0;
            start[type] += rental.items[type].count;
            if(end[type] === undefined) end[type] = 0;
            end[type] -= rental.items[type].count;
        }
    }
    timeline = Object.keys(timeline).map(function(time){return parseFloat(time)}).sort().map(function(time){return {time:time,types:timeline[time]}});

    //find the lowest count for every type in the timeline
    var min = {};
    if(timeline.length){
        var current = timeline[0].types;
        for(var i = 1; i < timeline.length; i++){
            if(timeline[i].time >= project.end) break;
            var time = timeline[i].types;
            for(var type in time){
                current[type] += time[type];
            }
            if(timeline[i].time < project.start) continue;
            for(var type in current){
                if(!min[type] || current[type] < min[type]){
                    min[type] = current[type];
                }
            }
        }
        for(var type in current){
            if(min[type] === undefined) min[type] = current[type];
        }
    }

    //add the lowest reservation count of each type to the available count
    for(var type in min){
        needed[type] -= min[type];
    }

    //calculate the needed value for each type
    for(var type in project.reserved){
        needed[type] += project.reserved[type];
        if(needed[type] <= 0){
            delete needed[type];
        }
    }
    return needed;
}