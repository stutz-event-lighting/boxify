var parse = require("co-body");
module.exports = function*(role){
    var body = yield parse.json(this);
    var query = {};
    if(body.search){
        var words = body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/\s\s+/g," ").split(" ");
        var needed = [];
        for(var i = 0; i < words.length; i++){
            needed.push({
                $or:[
                    {firstname:{$regex:words[i],$options:"i"}},
                    {lastname:{$regex:words[i],$options:"i"}}
                ]
            })
        }
        if(needed.length){
            query.$and = needed;
        }
    }
    if(body.role){
        query.roles = body.role;
    }
    if(body.type){
        query.type = body.type;
    }
    if(typeof role == "string"){
        query.roles = role;
    }
    var items = yield this.app.db.Contact.find(query,"firstname lastname");
    this.set("Content-Type","application/json");
    this.body = JSON.stringify(items);
}
