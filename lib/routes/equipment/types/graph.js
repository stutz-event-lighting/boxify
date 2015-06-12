var async = require("async");
var mongo = require("mongodb");

module.exports = function(req,res){
    var type = parseInt(req.params.type,10);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmentlogs").find({type:type,event:{$in:["added","removed"]}},{time:true,count:true,id:true,event:true}).sort({time:-1}).toArray(cb)
        },
        function(cb){
            var query = {};
            query["items."+type] = {$exists:true};
            req.app.db.collection("equipmentio").find(query,{project:true,type:true,time:true,items:true}).sort({time:-1}).toArray(cb)
        },
        function(cb){
            var query = {};
            query["items."+type] = {$exists:true};
            req.app.db.collection("equipmentreservations").find(query,{project:true,status:true,delivery:true,return:true,items:true}).sort({delivery:-1}).toArray(cb)
        },
        function(cb){
            var query = {};
            query["items."+type] = {$exists:true};
            req.app.db.collection("equipmentrentals").find(query,{status:true,delivery:true,return:true,items:true}).sort({delivery:-1}).toArray(cb)
        }
    ],function(err,results){
        if(err) return res.fail();
        var logs = results[0];
        var ios = results[1];
        var reservations = results[2];
        var rentals = results[3];

        var supplies = [];
        var demands = [];

        for(var i = 0; i < logs.length; i++){
            var log = logs[i];
            console.log(log.event)
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

        req.app.db.collection("projects").find({_id:{$in:projects}},{start:true,end:true,balance:true}).toArray(function(err,projects){
            if(err) return res.fail();
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
            console.log(demands);
            supplies.sort(function(a,b){return a.time - b.time});
            demands.sort(function(a,b){return a.time - b.time});

            console.log(demands);



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


            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify({supply:supplytimeline,ownsupply:ownsupplytimeline,demand:demandtimeline}));
        });
    })
}
