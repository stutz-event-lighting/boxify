var async = require("async");

module.exports = function(db,project,cb){
    async.parallel([
        function(cb){
            db.collection("equipmentio").find({project:project},{items:true}).toArray(cb);
        }
    ],function(err,results){
        if(err) return cb(err);
        var entries = results[0];

        var balance = {};
        for(var i = 0; i < entries.length; i++){
        	var entry = entries[i];
        	for(var type in entry.items){
        		var item = entry.items[type];
        		var balanceitem = balance[type];
        		if(!balanceitem) balance[type] = balanceitem = {count:0,suppliers:{}};
        		if(entry.type == "checkin"){
        			balanceitem.count += item.count;
        		}else{
        			balanceitem.count -= item.count;
        		}
        		for(var supplier in item.suppliers){
        			if(!balanceitem.suppliers[supplier]) balanceitem.suppliers[supplier] = 0;
        			if(entry.type == "checkin"){
        				balanceitem.suppliers[supplier] += item.suppliers[supplier].count;
        			}else{
        				balanceitem.suppliers[supplier] -= item.suppliers[supplier].count;
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
        	}
        }

        db.collection("projects").update({_id:project},{$set:{balance:balance}},function(err){
            if(err) return cb(err);
            cb(null,balance);
        })
    })
}
