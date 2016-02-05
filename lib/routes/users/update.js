var async = require("async");

module.exports = function(req,res){
    var id = parseFloat(req.params.id);

    var pull = [];
    var add = [];
    for(var permission in req.body.permissions){
        if(req.session.permissions.indexOf(permission) >= 0) (req.body.permissions[permission]?add:pull).push(permission);
    }

    req.app.db.collection("contacts").findOne({_id:id,$or:[{ownedBy:req.session.user},{_id:req.session.user}]},function(err,user){
        if(err || !user) return res.fail();
        async.parallel([
            function(cb){
                if(!pull.length) return cb();
                req.app.db.collection("contacts").update({_id:id},{$pullAll:{"permissions":pull}},cb)
            },
            function(cb){
                if(!add.length) return cb();
                req.app.db.collection("contacts").update({_id:id},{$addToSet:{"permissions":{$each:add}}},cb)
            },
            function(cb){
                var users = req.body.ownedUsers.map(function(id){return parseFloat(id)});
                req.app.db.collection("contacts").update({_id:{$in:users},$or:[{ownedBy:req.session.user},{_id:req.session.user}]},{$addToSet:{ownedBy:id}},{multi:true},function(){
                    if(err) return cb(err);
                    req.app.db.collection("contacts").update({_id:{$nin:users},ownedBy:id},{$pull:{ownedBy:id}},{multi:true},cb);
                })
            }
        ],function(err){
            if(err) throw err;
            if(err) return res.fail();
            res.end();
        })
    });
}
