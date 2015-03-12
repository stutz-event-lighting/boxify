var mongo = require("mongodb");

module.exports = function(req,res){
    var id = mongo.ObjectID(req.params.id);
    req.app.db.collection("equipmentrentals").find({supplier:id}).count(function(err,count){
        if(count) return res.fail(601,"Supplier in use");
        req.app.db.collection("contacts").findAndModify({_id:id},[],{$set:{supplier:false}},function(err,contact){
            if(err) return res.fail();
            if(contact.customer) return res.end();
            req.app.db.collection("contacts").remove({_id:id},function(err){
                if(err) return res.fail();
                res.end();
            })
        });
    });
}
