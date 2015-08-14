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
            query.$set.contents = req.body.contents;

            if(!Object.keys(query.$unset).length) delete query.$unset;

            req.app.db.collection("equipmenttypes").update({_id:id},query,cb);
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
    ],function(err){
        if(err) return res.fail();
        res.end();
    });
}
