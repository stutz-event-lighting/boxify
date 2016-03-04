var async = require("async");

module.exports = function(req,res){
    var id = parseFloat(req.params.user);
    if(req.session.user != id && req.session.permissions.indexOf("users_write") < 0) return res.fail(600);
    async.parallel([
        function(cb){
            req.app.db.collection("contacts").update({_id:id},{
                $unset:{
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
            req.app.db.collection("sessions").remove({user:id},cb)
        }
    ],function(err){
        if(err) throw err;
        if(err) return res.fail();
        res.end();
    });
}
