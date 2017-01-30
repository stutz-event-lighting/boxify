var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var needed = [];
    if(body.search){
        var words = body.search.split(" ");
        for(var word of words){
            var q = [{
                name:{$regex:"^"+word.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"}
            }];
            if(word.split(".").length == 2){
                var customer = parseFloat(word.split(".")[0]);
                var projectNumber = parseFloat(word.split(".")[1]);
                if(!isNaN(customer) && !isNaN(projectNumber)){
                    q.push({
                        customer:customer,
                        projectNumber:projectNumber
                    })
                }
            }
            needed.push({$or:q});
        }
    }
    if(body.finished !== true){
        needed.push({status:"ongoing"})
    }
    var projects = await ctx.app.db.Project
        .find({$and:needed})
        .select("name customer start end status")
        .populate("customer","firstname lastname")
        .sort({start:1});

    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(projects);
}
