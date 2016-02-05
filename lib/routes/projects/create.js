var mongo = require("mongodb");
module.exports = function(req,res){
    var customer = parseFloat(req.body.customer);
    req.app.db.collection("contacts").findAndModify(
        {_id:customer},
        null,
        {$inc:{lastProjectNumber:1}},
        {fields:{lastProjectNumber:true},new:true},
        function(err,c){
            req.app.db.collection("projects").insert({customer:customer,projectNumber:c.lastProjectNumber,name:req.body.name,start:req.body.start,end:req.body.end,balance:{},needs:{},status:"ongoing"},function(err,created){
                if(err) return res.fail();
                res.end(created[0]._id+"");
            });
        }
    )
}
