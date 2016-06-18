var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    var customer = parseFloat(body.customer);
    var c = yield this.app.db.Contact.findOneAndUpdate(
        {_id:customer},
        {$inc:{lastProjectNumber:1}},
        {select:"lastProjectNumber",new:true}
    );
    var id = mongo.ObjectID();
    yield this.app.db.Project.create({_id:id,customer:customer,projectNumber:c.lastProjectNumber,name:body.name,start:body.start,end:body.end,balance:{},needs:{},status:"ongoing"});
    this.body = id+"";
}
