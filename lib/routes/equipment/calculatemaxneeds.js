var async = require("async");

module.exports = function(db,start,end,cb){
    db.collection("projects").find({end:{$gte:start},start:{$lte:end}},{start:true,end:true}).toArray(function(err,projects){
        //create timeline out of all projects
        var timeline = {};
        for(var i = 0; i < projects.length; i++){
            var project = projects[i];
            var start = timeline[project.start];
            if(!start) timeline[project.start] = start = {};
            var end = timeline[project.end];
            if(!end) timeline[project.end] = end = {};
            for(var type in project.needs){
                if(start[type] === undefined) start[type] = 0;
                start[type] += project.needs[type].count;
                if(end[type] === undefined) end[type] = 0;
                end[type] -= project.needs[type].count;
            }
        }
        timeline = Object.keys(timeline).map(function(time){return parseFloat(time)}).sort().map(function(time){return timeline[time]});

        //find the lowest count for every type in the timeline
        if(timeline.length){
            var max = JSON.parse(JSON.stringify(timeline[0]));
            var current = timeline[0];
            for(var i = 1; i < timeline.length; i++){
                var time = timeline[i];
                for(var type in time){
                    current[type] += time[type];
                }
                for(var type in current){
                    if(!max[type] || current[type] > max[type]){
                        max[type] = current[type];
                    }
                }
            }
        }else{
            var max = {};
        }
    });
}
