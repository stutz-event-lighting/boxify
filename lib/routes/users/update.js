var mongo = require("mongodb");
var async = require("async");

module.exports = function(req,res){
    if(req.session.permissions.indexOf("users_write") < 0 && req.params.id != req.session.user+"") return res.fail();
    var query = {firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email};
    if(req.body.permissions) query.permissions = req.body.permissions;
    async.parallel([
        function(cb){
            req.app.db.collection("users").update({_id:new mongo.ObjectID(req.params.id)},{$set:query},cb);
        },
        function(cb){
            if(!req.body.image) return cb();
            var parts = req.body.image.split(",");
            var mime = parts[0].substring(5,parts[0].length-7);
            var data = new Buffer(parts[1],"base64");

            var store = new mongo.GridStore(req.app.db,new mongo.ObjectID(req.params.id),"","w",{root:"userimages",content_type:mime});
            store.open(function(err){
                if(err) return cb(err);
                store.write(data,true,cb);
            });
        }
    ],function(err){
        if(err) return res.fail();
        res.end();
    })
}
