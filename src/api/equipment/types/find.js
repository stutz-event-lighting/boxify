var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this);

    var query = {};
    if(body.search){

        var words = body.search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").replace(/\s\s+/g," ").split(" ");
        var needed = [];
        for(var i = 0; i < words.length; i++){
            needed.push({
                $or:[
                    {name:{$regex:words[i],$options:"i"}},
                    {manufacturer:{$regex:words[i],$options:"i"}},
                    {tags:{$regex:words[i],$options:"i"}}
                ]
            })
        }
        if(needed.length){
            query.$and = needed;
        }
    }
    var items = yield this.app.db.EquipmentType.find(query).select("name manufacturer category count weight height width length");
    this.set("Content-Type","application/json");
    this.body = JSON.stringify(items);
}
