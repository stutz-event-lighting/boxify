var async = require("async");

var calcEquipmentBalance = require("../equipment/calculatebalance.js");

module.exports = function(db,project,cb){
    db.collection("projects").findOne({_id:project},{start:true,end:true,reserved:true},function(err,project){
        if(err || !project) return cb(err||new Error("Project does not exist"));
        async.parallel([
            function(cb){
                calcEquipmentBalance(db,cb);
            },
            function(cb){
                db.collection("equipmentrentals").find({return:{$gte:project.start},delivery:{$lte:project.end},status:{$in:["booked","received"]}},{delivery:true,return:true,items:true}).toArray(cb)
            }
        ],function(err,results){

            if(err) return cb(err);

            var balance = results[0];
            var rentals = results[1];

            for(var type in balance){
                balance[type] = -balance[type].count;
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
            timeline = Object.keys(timeline).map(function(time){return parseFloat(time)}).sort().map(function(time){return timeline[time]});

            //find the lowest count for every type in the timeline
            if(timeline.length){
                var min = JSON.parse(JSON.stringify(timeline[0]));
                var current = timeline[0];
                for(var i = 1; i < timeline.length; i++){
                    var time = timeline[i];
                    for(var type in time){
                        current[type] += time[type];
                    }
                    for(var type in current){
                        if(!min[type] || current[type] < min[type]){
                            min[type] = current[type];
                        }
                    }
                }
            }else{
                var min = {};
            }

            //add the lowest reservation count of each type to the available count
            for(var type in min){
                balance[type] += min[type];
            }

            //calculate the needed value for each type
            for(var type in project.reserved){
                balance[type] += project.reserved[type];
                if(balance[type] <= 0){
                    delete balance[type];
                }
            }
            cb(null,balance);
        })
    })
}
