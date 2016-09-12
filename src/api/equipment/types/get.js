module.exports = async function(ctx){
    var id = parseInt(ctx.params.id,10);
    var d = await Promise.all([
        ctx.app.db.EquipmentType
            .findOne({_id:id})
            .select("name manufacturer manufacturerArticlenumber manufacturerEAN technicalDescription category tags count weight height width length rent factoryPrice contents")
            .populate("contents"),
        async function(){
            var query = {};
            query["balance."+id] = {$exists:true};
            return await ctx.app.db.Project.find(query).select("name end balance")
        }.call(ctx),
        async function(){
            var query = {end:{$gte:new Date().getTime()}};
            query["reserved."+id] = {$exists:true};
            return await ctx.app.db.Project.find(query).select("name start end reserved status")
        }.call(ctx),
        async function(){
            var query = {status:{$in:["booked","received"]}};
            query["items."+id] = {$exists:true};
            return await ctx.app.db.EquipmentRental.find(query).select("name delivery return items status")
        }.call(ctx)
    ]);
    var item = JSON.parse(JSON.stringify(d[0]));
    item.locations = d[1].map(function(project){
        return {_id:project._id,name:project.name,to:project.end,count:-project.balance[id].count};
    });
    item.reservations = d[2].map(function(project){
        return {_id:project._id,name:project.name,from:project.start,to:project.end,count:project.reserved[id]};
    });
    item.rentals = d[3].map(function(rental){
        return {_id:rental._id,name:rental.name,from:rental.delivery,to:rental.return,count:rental.items[id].count,status:rental.status}
    });

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(item);
}
