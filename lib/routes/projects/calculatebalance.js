var async = require("async");

module.exports = function(db,project,cb){
    async.parallel([
        function(cb){
            db.collection("equipmentcheckouts").find({project:project},{items:true}).toArray(cb);
        },
        function(cb){
            db.collection("equipmentcheckins").find({project:project},{items:true}).toArray(cb)
        },
    ],function(err,results){
        if(err) return cb(err);
        var entries = results[0].concat(results[1].map(function(checkin){
        	checkin.checkin = true;
        	return checkin
        }));

        var balance = {};
        for(var i = 0; i < entries.length; i++){
        	var entry = entries[i];
        	for(var type in entry.items){
        		var item = entry.items[type];
        		var balanceitem = balance[type];
        		if(!balanceitem) balance[type] = balanceitem = {count:0,suppliers:{}};
        		if(entry.checkin){
        			balanceitem.count += item.count;
        		}else{
        			balanceitem.count -= item.count;
        		}
        		for(var supplier in item.suppliers){
        			if(!balanceitem.suppliers[supplier]) balanceitem.suppliers[supplier] = {count:0,ids:[]};
        			if(entry.checkin){
        				balanceitem.suppliers[supplier].count += item.suppliers[supplier].count;
        			}else{
        				balanceitem.suppliers[supplier].count -= item.suppliers[supplier].count;
        			}
        			var ids = item.suppliers[supplier].ids;
        			if(ids){
        				for(var j = 0; j < ids.length; j++){
        					if(entry.checkin){
        						delete balanceitem.suppliers[supplier].ids[ids[j]];
        					}else{
        						balanceitem.suppliers[supplier].ids[ids[j]] = true;
        					}
        				}
        			}
        		}
        	}
        }

        for(var type in balance){
        	var item = balance[type];
        	if(!item.count){
        		delete balance[type];
        		continue;
        	}
        	for(var supplier in item.suppliers){
        		var supp = item.suppliers[supplier];
        		if(!supp.count){
        			delete item.suppliers[supplier];
        			continue;
        		}
        		supp.ids = Object.keys(supp.ids);
        		if(!supp.ids.length) delete supp.ids;
        	}
        }

        db.collection("projects").update({_id:project},{$set:{balance:balance}},function(err){
            if(err) return cb(err);
            cb(null,balance);
        })
    })
}
