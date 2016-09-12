module.exports = function*(db,project){
    var entries = yield db.EquipmentIo.find({project:project,draft:{$ne:true}}).select("items type");
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
    		if(!item.suppliers[supplier]){
    			delete item.suppliers[supplier];
    		}
    	}
    }

    yield db.Project.update({_id:project},{$set:{balance:balance}});
    return balance;
}
