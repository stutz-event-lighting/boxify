var async = require("async");

module.exports = function(req,res){
    var id = parseFloat(req.params.id);
    if(req.session.user != id && req.session.permissions.indexOf("users_write") < 0) return res.fail(600);
    var pull = [];
    var add = [];
    for(var permission in req.body.permissions){
        if(req.session.permissions.indexOf(permission) >= 0) (req.body.permissions[permission]?add:pull).push(permission);
    }
    async.parallel([
        function(cb){
            if(!pull.length) return cb();
            req.app.db.collection("contacts").update({_id:id},{$pullAll:{"permissions":pull}},cb)
        },
        function(cb){
            if(!add.length) return cb();
            req.app.db.collection("contacts").update({_id:id},{$addToSet:{"permissions":{$each:add}}},cb)
        }
    ],function(err){
        if(err) throw err;
        if(err) return res.fail();
        res.end();
    })
}
