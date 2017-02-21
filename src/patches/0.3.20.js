var calcProjectBalance = require("../api/projects/calculatebalance");
module.exports = async function(){
    var db = this.db;
	var projects = (await db.collection("projects").find({status:"finished",$and:[{reserved:{$ne:{}}},{reserved:{$ne:null}}]}).toArray()).map(p=>p._id);
	await db.collection("equipmentreservations").remove({project:{$in:projects}});
	await db.collection("projects").update({_id:{$in:projects}},{$set:{reserved:{}}},{multi:true});
	var ios = await db.collection("equipmentios").find().toArray();
	for(var io of ios){
		if(projects.map(id=>id+"").indexOf(io.project+"")<0) continue;
		await db.collection("equipmentio").insert(io);
	}
	await db.collection("equipmentios").drop();

	var types = {};
	var ios = await db.collection("equipmentio").find().toArray();
	for(var io of ios){
		for(var type in io.items) types[type] = true;
	}
	var reservations = await db.collection("equipmentreservations").find().toArray();
	for(var reservation of reservations){
		for(var type in reservation.items) types[type] = true;
	}

	var typesById = (await db.collection("equipmenttypes").find().toArray()).reduce((i,t)=>{
		i[t._id] = true;
		return i;
	},{});

	for(var type in types){
		if(!typesById[type]) await db.collection("equipmenttypes").insert({_id:parseFloat(type),name:"Gelöschter Typ",count:0,nextId:0})
	}

	var projects = (await db.collection("projects").find().toArray()).map(p=>p._id);
	await Promise.all(projects.map(p=>calcProjectBalance(db,p)));
}
