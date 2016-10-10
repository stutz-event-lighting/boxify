var mongo = require("mongodb");
var util = require("../../util");
var calcNeeded = require("../projects/calculateneeded");

module.exports = async function(ctx){
    var [rental,project] = await Promise.all([
        async function(){
            if(["newrequest","newbooking","newrental"].indexOf(ctx.params.rental) >= 0) return;
            return await ctx.app.db.EquipmentRental.findOne({_id:mongo.ObjectID(ctx.params.rental)}).select("name items status supplier");
        }.call(ctx),
        async function(){
            if(!ctx.query.project) return;
            var [project,needed] = await Promise.all([
                ctx.app.db.Project.findOne({_id:mongo.ObjectID(ctx.query.project)}).select("start end"),
                calcNeeded(ctx.app.db,mongo.ObjectID(ctx.query.project))
            ]);
            project.needed = needed;
            return project;
        }.call(ctx)
    ]);

    if(!rental){
        rental = {name:"",supplier:null,items:{},status:"requested",delivery:null,return:null};
        if(project){
            for(var type in project.needed){
                if(project.needed[type] <= 0) continue;
                rental.items[type] = {
                    count:project.needed[type],
                    ids:[]
                };
            }
            rental.delivery = project.start;
            rental.return = project.end;
        }
    }

    //implement a logic where the 'count' property gets calculated for every type,
    //if there is a 'project' parameter given to ctx route

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(rental);
}
