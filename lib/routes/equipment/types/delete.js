var async = require("async");
module.exports = function(req,res){
    var id = parseFloat(req.params.id);
    async.parallel([
        function(cb){
            req.app.db.collection("equipmenttypes").remove({_id:id},cb)
        },
        function(cb){
            req.app.db.collection("equipment").remove({type:id},cb);
        },
        function(cb){
            req.app.db.collection("equipmentlogs").remove({type:id},cb);
        },
        function(cb){
            req.app.db.collection("equipmentimages.files").remove({_id:id},cb);
        },
        function(cb){
            req.app.db.collection("equipmentimages.chunks").remove({files_id:id},cb);
        }
    ],function(err){
        if(err) return res.fail();
        res.end();
    })
}
