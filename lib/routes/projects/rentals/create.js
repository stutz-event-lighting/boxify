var mongo = require("mongodb");

module.exports = function(req,res){
    var project = mongo.ObjectID(req.params.project);
    var supplier = mongo.ObjectID(req.body.supplier);
    req.app.db.collection("equipmentrentals").insert({project:project,supplier:supplier,items:{},status:"booked"},function(err,created){
        if(err) return res.fail();
        res.end(created[0]._id+"");
    })
}
