var util = require("../../util");

module.exports = function*(db){
    var results = yield [
        db.EquipmentType.find({}).select("count"),
        db.Project.find({balance:{$ne:{}}}).select("balance"),
        db.EquipmentRental.find({status:"received"}).select("items supplier")
    ]
    var types = util.createIndex(JSON.parse(JSON.stringify(results[0])),"_id");
    var projects = results[1];
    var rentals = results[2];

    for(var type in types){
        type = types[type];
        type.suppliers = {own:type.count};
    }

    for(var i = 0; i < projects.length; i++){
        var project = projects[i];
        for(var type in project.balance){
            var t = types[type];
            var item = project.balance[type];
            t.count += item.count;
            for(var supplier in item.suppliers){
                t.suppliers[supplier] = (t.suppliers[supplier]||0) + item.suppliers[supplier];
            }
        }
    }
    for(var i = 0; i < rentals.length; i++){
        var rental = rentals[i];
        for(var type in rental.items){
            var t = types[type];
            var item = rental.items[type];
            t.count += item.count;
            t.suppliers[rental.supplier+""] = (t.suppliers[rental.supplier+""]||0)+item.count;
        }
    }
    return types;
}
