var mongo = require("mongodb");

module.exports = function(req,res){
    if(req.params.rental.length != 24) req.params.rental = mongo.ObjectID()+"";
    req.app.db.collection("equipmentrentals").update({_id:mongo.ObjectID(req.params.rental)},{$set:{
        name:req.body.name,
        supplier:mongo.ObjectID(req.body.supplier),
        delivery:req.body.delivery,
        return:req.body.return,
        status:req.body.status,
        items:req.body.items,
        projects:req.body.projects||[]
    }},{upsert:true},function(err){
        if(err) return res.fail();
        res.end();
    });
}
