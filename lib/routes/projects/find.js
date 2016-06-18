var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    var query = {};
    if(body.search){
        query.name = {$regex:"^"+body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),$options:"i"};
    }
    if(body.finished !== true){
        query.status = "ongoing";
    }
    var projects = yield this.app.db.Project
        .find(query)
        .select("name customer start end status")
        .populate("customer","firstname lastname")
        .sort({start:1});

    this.set("Content-Type","application/json");
    this.body = JSON.stringify(projects);
}
