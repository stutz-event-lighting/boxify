var mongo = require("mongodb");
var async = require("async");
var util = require("../../util");
var calcNeeded = require("../projects/calculateneeded");

module.exports = function*(){
    var results = yield [
        this.app.db.EquipmentType.find({}).select("name category"),
        this.app.db.EquipmentCategory.find({}).select("name"),
        function*(){
            if(["newrequest","newbooking","newrental"].indexOf(this.params.rental) >= 0) return;
            return yield this.app.db.EquipmentRental.findOne({_id:mongo.ObjectID(this.params.rental)}).select("name items status supplier");
        }.bind(this),
        function*(){
            if(!this.query.project) return;

            var results = yield [
                this.app.db.Project.findOne({_id:mongo.ObjectID(this.query.project)}).select("start end"),
                calcNeeded(this.app.db,mongo.ObjectID(this.query.project))
            ];
            var project = JSON.parse(JSON.stringify(results[0]));
            project.needed = results[1];
            return project;
        }.bind(this)
    ];

    var types = util.createIndex(JSON.parse(JSON.stringify(results[0])),"_id");
    var categories = util.createIndex(results[1],"_id");
    var rental = results[2];
    var project = results[3];

    if(rental){
        for(var type in rental.items){
            types[type].count = rental.items[type].count;
            types[type].ids = rental.items[type].ids;
        }
        delete rental.items;
    }else if(project){
        for(var type in project.needed){
            if(project.needed[type] <= 0) continue;
            types[type].count = project.needed[type];
            types[type].ids = [];
        }
        rental = {
            delivery:project.start,
            return:project.end,
            status:"requested"
        };
    }

    //implement a logic where the 'count' property gets calculated for every type,
    //if there is a 'project' parameter given to this route

    this.set("Content-Type","application/json");
    this.body = JSON.stringify({
        types:types,
        categories:categories,
        rental:rental
    });
}
