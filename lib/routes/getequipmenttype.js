var async = require("async");
module.exports = function(req,res){
    var id = parseInt(req.params.id,10);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmenttypes").findOne({_id:id},{_id:true,name:true,category:true,count:true,weight:true,height:true,width:true,length:true,accessories:true},function(err,item){
                if(err || item == null) return cb(err||new Error("Equipmenttype not found"));
                if(item.accessories.length){
                    var accessoriesbyid = {};
                    req.app.db.collection("equipmenttypes").find({_id:item.accessories.map(function(accessory){
                        accessoriesbyid[accessory._id] = accessory;
                        return accessory._id
                    })},{name:true}).toArray(function(err,accessories){
                        for(var i = 0; i < accessories.length; i++){
                            accessoriesbyid[accessories[i]._id].name = accessories[i].name
                        }
                        cb(null,item);
                    })
                }else{
                    cb(null,item);
                }
            })
        },
        function(cb){
            req.app.db.collection("equipment").find({type:id},{id:true,name:true}).toArray(function(err,stock){
                if(err) return cb(err);
                cb(null,stock);
            })
        }
    ],function(err,d){
        if(err) return res.fail();
        var item = d[0];
        item.stock = d[1];
        res.writeHead(200,"OK",{"Content-Type":"application/json"});
        res.end(JSON.stringify(item));
    });
}
