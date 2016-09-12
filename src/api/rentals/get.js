var mongo = require("mongodb");
var util = require("../../util");
var calcNeeded = require("../projects/calculateneeded");

module.exports = async function(ctx){
    var results = await Promise.all([
        ctx.app.db.EquipmentType.find({}).select("name category"),
        ctx.app.db.EquipmentCategory.find({}).select("name"),
        async function(){
            if(["newrequest","newbooking","newrental"].indexOf(ctx.params.rental) >= 0) return;
            return await ctx.app.db.EquipmentRental.findOne({_id:mongo.ObjectID(ctx.params.rental)}).select("name items status supplier");
        }.call(ctx),
        async function(){
            if(!ctx.query.project) return;

            var results = await Promise.all([
                ctx.app.db.Project.findOne({_id:mongo.ObjectID(ctx.query.project)}).select("start end"),
                calcNeeded(ctx.app.db,mongo.ObjectID(ctx.query.project))
            ]);
            var project = JSON.parse(JSON.stringify(results[0]));
            project.needed = results[1];
            return project;
        }.call(ctx)
    ]);

    var types = util.createIndex(JSON.parse(JSON.stringify(results[0])),"_id");
    var categories = util.createIndex(results[1],"_id");
    var rental = results[2];
    var project = results[3];

    if(rental){
        for(var type in rental.items){
            types[type].count = rental.items[type].count;
            types[type].ids = rental.items[type].ids;
        }
        delete rental.items;
    }else if(project){
        for(var type in project.needed){
            if(project.needed[type] <= 0) continue;
            types[type].count = project.needed[type];
            types[type].ids = [];
        }
        rental = {
            delivery:project.start,
            return:project.end,
            status:"requested"
        };
    }

    //implement a logic where the 'count' property gets calculated for every type,
    //if there is a 'project' parameter given to ctx route

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify({
        types:types,
        categories:categories,
        rental:rental
    });
}
