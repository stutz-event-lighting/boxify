var async = require("async");
var mongo = require("mongodb");

module.exports = function(req,res){
    var id = parseInt(req.params.id,10);
    async.parallel([
        function(cb){
            var query = {$set:{
                name:req.body.name
            },$unset:{}};
            if(req.body.manufacturer){
                query.$set.manufacturer = req.body.manufacturer;
            }else{
                query.$unset.manufacturer = 1;
            }
            if(req.body.manufacturerArticlenumber){
                query.$set.manufacturerArticlenumber = req.body.manufacturerArticlenumber;
            }else{
                query.$unset.manufacturerArticlenumber = 1;
            }
            if(req.body.manufacturerEAN){
                query.$set.manufacturerEAN = req.body.manufacturerEAN;
            }else{
                query.$unset.manufacturerEAN = 1;
            }
            if(req.body.technicalDescription){
                query.$set.technicalDescription = req.body.technicalDescription;
            }else{
                query.$unset.technicalDescription = 1;
            }
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
            if(req.body.rent === undefined){
                query.$unset.rent = 1;
            }else{
                query.$set.rent = req.body.rent;
            }
            if(req.body.factoryPrice === undefined){
                query.$unset.factoryPrice = 1;
            }else{
                query.$set.factoryPrice = req.body.factoryPrice;
            }
            if(req.body.category == undefined){
                query.$unset.category = 1;
            }else{
                query.$set.category = mongo.ObjectID(req.body.category);
            }
            if(req.body.tags == undefined){
                query.$unset.tags = 1;
            }else{
                query.$set.tags = req.body.tags;
            }

            query.$set.contents = req.body.contents;

            if(!Object.keys(query.$unset).length) delete query.$unset;

            req.app.db.collection("equipmenttypes").findAndModify({_id:id},{},query,cb);
        },
        function(cb){
            if(!req.body.image) return cb();
            var parts = req.body.image.split(",");
            var mime = parts[0].substring(5,parts[0].length-7);
            var data = new Buffer(parts[1],"base64");

            var store = new mongo.GridStore(req.app.db,parseFloat(req.params.id),parseFloat(req.params.id),"w",{root:"equipmentimages",content_type:mime});
            store.open(function(err){
                if(err) return cb(err);
                store.write(data,true,cb);
            })

        }
    ],function(err,results){
        if(err) return res.fail();
        var old = results[0][0];
        var before = old.tags||[];
        var after = req.body.tags||[];
        var create = after.filter(function(tag){return before.indexOf(tag) < 0});
        var del = before.filter(function(tag){return after.indexOf(tag) < 0});

        cleanupTags(req.app.db,create,del,function(){
            res.end();
        });
    });
}

function cleanupTags(db,create,del,cb){
    async.parallel([
        function(cb){
            async.each(create,function(tag,cb){
                db.collection("equipmenttags").update({_id:tag},{$set:{_id:tag}},{upsert:true},cb);
            },cb);
        },
        function(cb){
            async.each(del,function(tag,cb){
                db.collection("equipmenttypes").findOne({tags:tag},{},function(err,type){
                    if(err || type) return cb(err);
                    db.collection("equipmenttags").remove({_id:tag},cb);
                });
            },cb);
        }
    ],cb);
}
