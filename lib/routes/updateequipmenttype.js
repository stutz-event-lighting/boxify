var async = require("async");

module.exports = function(req,res){
    var id = parseInt(req.params.id,10);
    async.parallel([
        function(cb){
            var query = {$set:{
                name:req.body.name
            },$unset:{}};

            if(req.body.weight === undefined){
                query.$unset.weight = 1;
            }else{
                query.$set.weight = req.body.weight;
            }
            if(req.body.length === undefined){
                query.$unset.length = 1;
            }else{
                query.$set.length = req.body.length;
            }
            if(req.body.width === undefined){
                query.$unset.width = 1;
            }else{
                query.$set.width = req.body.width;
            }
            if(req.body.height === undefined){
                query.$unset.height = 1;
            }else{
                query.$set.height = req.body.height;
            }

            if(!Object.keys(query.$unset).length) delete query.$unset;

            req.app.db.collection("equipmenttypes").update({_id:id},query,cb);
        },
        function(cb){
            if(!req.body.image) return cb();
            console.log(req.body.image);
            cb();
        }
    ],function(err){
        if(err) return res.fail();
        res.end();
    });
}
