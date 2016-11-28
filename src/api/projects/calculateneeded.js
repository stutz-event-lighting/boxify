var calcEquipmentBalance = require("../equipment/calculatebalance");

module.exports = async function(db,project){
    var project = await db.Project.findOne({_id:project}).select("start end reserved");
    if(!project) throw new Error("Project does not exist");
    var [needed,rentals,reservations] = await Promise.all([
        calcEquipmentBalance(db),
        db.EquipmentRental.find({return:{$gte:project.start},delivery:{$lte:project.end},status:{$in:["requested","booked"]}}).select("delivery return items").lean(),
        db.Project.find({start:{$lte:project.start},end:{$gte:project.end}}).select("start end reserved").lean()
    ]);

    for(var type in needed){
        needed[type] = -needed[type].count;
    }

    var changes = reservations.map(r=>{
        r.items = r.reserved||{};
        delete r.reserved;
        return r;
    }).concat(rentals.map(r=>{
        for(var key in r.items){
            r.items[key] = -r.items[key].count;
        }
        return {start:r.delivery,end:r.return,items:r.items};
    }));

    //create timeline out of all projects
    var timeline = {};
    for(var i = 0; i < changes.length; i++){
        var change = changes[i];
        var start = timeline[change.start];
        if(!start) timeline[change.start] = start = {};
        var end = timeline[change.end];
        if(!end) timeline[change.end] = end = {};
        for(var type in change.items){
            if(start[type] === undefined) start[type] = 0;
            start[type] -= change.items[type];
            if(end[type] === undefined) end[type] = 0;
            end[type] += change.items[type];
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
                if(!current[type]) current[type] = 0;
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

    return needed;
}
