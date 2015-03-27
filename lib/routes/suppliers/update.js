var mongo = require("mongodb");
var async = require("async");
module.exports = function(req,res){
    async.parallel([
        function(cb){
            req.app.db.collection("contacts").update({_id:mongo.ObjectID(req.params.id)},{$set:{name:req.body.name}},cb)
        },
        function(cb){
            if(!req.body.image) return cb();
            var parts = req.body.image.split(",");
            var mime = parts[0].substring(5,parts[0].length-7);
            var data = new Buffer(parts[1],"base64");
            var store = new mongo.GridStore(req.app.db,parseFloat(req.params.id),parseFloat(req.params.id),"w",{root:"contacts",content_type:mime});
            store.open(function(err){
                if(err) return cb(err);
                store.write(data,true,cb);
            })
        }
    ],function(err){
        if(err) return res.fail();
        res.end();
    })
}
