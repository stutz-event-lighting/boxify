var mongo = require("mongodb");
module.exports = function(req,res){
    try{
        req.body.project = mongo.ObjectID(req.body.project);
    }catch(e){
        return res.fail();
    }
    var io = {
        type: ["checkout","checkin"].indexOf(req.body.type)>=0?req.body.type:"checkout",
        project:req.body.project,
        draft:true,
        delivered:true,
        items:{},
        history:[]
    };
    if(req.body.reservation){
        try{
            io.reservation = mongo.ObjectID(req.body.reservation);
        }catch(e){
            return res.fail();
        }
    }
    req.app.db.collection("equipmentio").insert(io,function(err,created){
        if(err) return res.fail();
        res.end(created.ops[0]._id+"");
    })
}
