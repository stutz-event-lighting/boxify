var async = require("async");
var util = require("./util.js");

module.exports = function(db,cb){
    async.parallel([
        function(cb){
            db.collection("equipmenttypes").find({},{count:true}).toArray(cb)
        },
        function(cb){
            db.collection("projects").find({balance:{$ne:{}}},{balance:true},cb);
        }
    ],function(err,results){
        if(err) return cb(err);
        var types = util.createIndex(results[0],"_id");

        var projects = results[1];
        for(var i = 0; i < projects.length; i++){
            var project = projects[i];
            for(var type in project.balance){
                var own = project.balance[type].own;
                if(own){
                    types[type].count += own.count;
                }
            }
        }

        cb(null,types);
    });
}
