var async = require("async");

module.exports = function(req,res){
    var id = parseFloat(req.params.user);
    req.app.db.collection("contacts").findOne({_id:id,$or:[{ownedBy:req.session.user},{_id:req.session.user}]},function(err,user){
        if(err || !user) return res.fail();
        async.parallel([
            function(cb){
                req.app.db.collection("contacts").update({_id:id},{
                    $unset:{
                        ownedBy:true,
                        password:true,
                        pin:true,
                        permissions:true
                    },
                    $pull:{
                        roles:"user"
                    }
                },cb);
            },
            function(cb){
                req.app.db.collection("contacts").update({ownedBy:id},{
                    $pull:{ownedBy:id}
                },{multi:true},cb);
            },
            function(cb){
                req.app.db.collection("sessions").remove({user:id},cb)
            }
        ],function(err){
            if(err) throw err;
            if(err) return res.fail();
            res.end();
        });
    })
}
