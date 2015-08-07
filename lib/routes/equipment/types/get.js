var async = require("async");
module.exports = function(req,res){
    var id = parseInt(req.params.id,10);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmenttypes").findOne({_id:id},{_id:true,name:true,category:true,count:true,weight:true,height:true,width:true,length:true,contents:true},function(err,item){
                if(err || item == null) return cb(err||new Error("Equipmenttype not found"));
                if(item.contents && item.contents.length){
                    req.app.db.collection("equipmenttypes").find({_id:{$in:item.contents}},{name:true}).toArray(function(err,types){
                        if(err) return cb(err);
                        item.contents = types;
                        cb(null,item);
                    })
                }else{
                    item.contents = [];
                    cb(null,item);
                }
            })
        },
        function(cb){
            req.app.db.collection("equipment").find({type:id},{id:true,name:true}).toArray(function(err,stock){
                if(err) return cb(err);
                cb(null,stock);
            })
        },
        function(cb){
            var query = {};
            query["balance."+id] = {$exists:true};
            req.app.db.collection("projects").find(query,{name:true,end:true,balance:true}).toArray(cb)
        },
        function(cb){
            var query = {end:{$gte:new Date().getTime()}};
            query["reserved."+id] = {$exists:true};
            req.app.db.collection("projects").find(query,{name:true,start:true,end:true,reserved:true,status:"ongoing"}).toArray(cb)
        },
        function(cb){
            var query = {status:{$in:["booked","received"]}};
            query["items."+id] = {$exists:true};
            req.app.db.collection("equipmentrentals").find(query,{name:true,delivery:true,return:true,items:true,status:true}).toArray(cb)
        }
    ],function(err,d){
        if(err) return res.fail();
        var item = d[0];
        item.stock = d[1];
        item.locations = d[2].map(function(project){
            return {_id:project._id,name:project.name,to:project.end,count:-project.balance[id].count};
        });
        item.reservations = d[3].map(function(project){
            return {_id:project._id,name:project.name,from:project.start,to:project.end,count:project.reserved[id]};
        });
        item.rentals = d[4].map(function(rental){
            return {_id:rental._id,name:rental.name,from:rental.delivery,to:rental.return,count:rental.items[id].count,status:rental.status}
        });

        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(item));
    });
}
