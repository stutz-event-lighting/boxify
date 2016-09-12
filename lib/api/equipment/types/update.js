var async = require("async");
var mongo = require("mongodb");
var parse = require("co-body");

module.exports = function*(){
    var body = yield parse.json(this,{limit:"10mb"});
    var id = parseInt(this.params.id,10);
    var results = yield[
        function*(){
            var query = {$set:{
                name:body.name
            },$unset:{}};
            if(body.manufacturer){
                query.$set.manufacturer = body.manufacturer;
            }else{
                query.$unset.manufacturer = 1;
            }
            if(body.manufacturerArticlenumber){
                query.$set.manufacturerArticlenumber = body.manufacturerArticlenumber;
            }else{
                query.$unset.manufacturerArticlenumber = 1;
            }
            if(body.manufacturerEAN){
                query.$set.manufacturerEAN = body.manufacturerEAN;
            }else{
                query.$unset.manufacturerEAN = 1;
            }
            if(body.technicalDescription){
                query.$set.technicalDescription = body.technicalDescription;
            }else{
                query.$unset.technicalDescription = 1;
            }
            if(body.weight === undefined){
                query.$unset.weight = 1;
            }else{
                query.$set.weight = body.weight;
            }
            if(body.length === undefined){
                query.$unset.length = 1;
            }else{
                query.$set.length = body.length;
            }
            if(body.width === undefined){
                query.$unset.width = 1;
            }else{
                query.$set.width = body.width;
            }
            if(body.height === undefined){
                query.$unset.height = 1;
            }else{
                query.$set.height = body.height;
            }
            if(body.rent === undefined){
                query.$unset.rent = 1;
            }else{
                query.$set.rent = body.rent;
            }
            if(body.factoryPrice === undefined){
                query.$unset.factoryPrice = 1;
            }else{
                query.$set.factoryPrice = body.factoryPrice;
            }
            if(body.category == undefined){
                query.$unset.category = 1;
            }else{
                query.$set.category = mongo.ObjectID(body.category);
            }
            if(body.tags == undefined){
                query.$unset.tags = 1;
            }else{
                query.$set.tags = body.tags;
            }

            if(body.contents !== undefined){
                query.$set.contents = body.contents;
            }else{
                query.$unset.contents = 1;
            }


            if(!Object.keys(query.$unset).length) delete query.$unset;

            return yield this.app.db.EquipmentType.findOneAndUpdate({_id:id},query);
        }.bind(this),
        function*(){
            if(!body.image) return;
            var parts = body.image.split(",");
            var mime = parts[0].substring(5,parts[0].length-7);
            var data = new Buffer(parts[1],"base64");

            var store = new mongo.GridStore(this.app.db.db,parseFloat(this.params.id),parseFloat(this.params.id),"w",{root:"equipmentimages",content_type:mime});
            yield store.open();
            yield store.write(data,true);
        }.bind(this)
    ];


    var old = results[0];
    var before = old.tags||[];
    var after = body.tags||[];
    var create = after.filter(function(tag){return before.indexOf(tag) < 0});
    var del = before.filter(function(tag){return after.indexOf(tag) < 0});

    yield [
        createTags(this.app.db,create),
        deleteTags(this.app.db,del)
    ];

    this.status = 200;
}

function* createTags(db,tags){
    yield tags.map(function(tag){
        return db.EquipmentTag.update({_id:tag},{$set:{_id:tag}},{upsert:true});
    });
}

function* deleteTags(db,tags){
    yield tags.map(function(tag){
        return function*(){
            if(!(yield db.EquipmentType.findOne({tags:tag}))){
                yield db.EquipmentTag.remove({_id:tag});
            }
        }
    });
}
