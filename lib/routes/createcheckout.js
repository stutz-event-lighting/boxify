var mongo = require("mongodb");
module.exports = function(){
    if(req.body.reservation){
        req.app.db.collection("equipmentreservatinos").findOne({_id:mongo.ObjectID(req.body.reservation)},{items:true},function(err,reservation){
            if(err || !reservation) return res.fail();
            req.app.db.collection("equipmentreservations").remove({_id:mongo.ObjectID(req.body.reservation)},function(){
                create(reservation.items);
            });
        });
    }else{
        create([]);
    }

    function create(items){
        req.app.db.collection("equipmentcheckouts").insert({project:mongo.ObjectID(req.params.project),checklist:req.body.checklist||[],items:{}},function(err,inserts){
            if(err) return res.fail();
            res.end(inserts[0]._id+"");
        })
    }
}
