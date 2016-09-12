var mongo = require("mongodb");
var moment = require("moment");
var Template = require("docxtemplater");
var fs = require("fs-promise");
var path = require("path");

module.exports = function*(){
    var _id = mongo.ObjectID(this.params.io);
    var checkout = yield this.app.db.EquipmentIo
        .findOne({_id:_id})
        .select("project time items history person")
        .populate("project","projectNumber customer name start end")
        .populate("person","firstname lastname emails phones")
        .populate("customer","type salutation firstname lastname streetName streetNr zip city emails phones")
    var articleIds = Object.keys(checkout.items).map(function(id){return parseFloat(id)});

    var articles = yield this.app.db.EquipmentType.find({_id:{$in:articleIds}});
    var project = checkout.project;
    var person = checkout.person;
    var customer = checkout.customer;

    var data = {
        project_id:project.projectNumber,
        project_name:project.name,
        project_start:moment(project.start).format("DD.MM.YYYY"),
        project_end:moment(project.end).format("DD.MM.YYYY"),
        customer_id:customer._id+"",
        customer:[
            customer.firstname,
            [customer.streetName,customer.streetNr].filter(function(val){return val}).join(" "),
            [customer.zip,customer.city].filter(function(val){return val}).join(" "),
            "Schweiz",
            getStandard(customer.phones).number,
            getStandard(customer.emails).email
        ].filter(function(val){return val}).join("\r\n"),
        person:person?[
            person.firstname,
            person.lastname,
            getStandard(person.phones).number,
            getStandard(person.emails).email
        ].filter(function(val){return val}).join("\r\n"):"",
        articles:[],
        totalCount:0,
        totalVolume:0,
        totalWeight:0
    };

    for(var i = 0; i < articles.length; i++){
        var article = articles[i];
        var volume = (article.height>0&&article.width>0&&article.length>0)?(article.height*article.width*article.length):0;
        var a = {
            name:[article.name,article.technicalDescription].filter(function(val){return val}).join("\r\n"),
            count:checkout.items[article._id+""].count,
            volume: volume * calcSingleCount(article._id,checkout.history),
            weight: (article.weight>0?article.weight:0)*checkout.items[article._id+""].count
        };

        data.totalVolume += a.volume;
        data.totalWeight += a.weight;
        data.totalCount += a.count;
        a.volume = (a.volume/1000).toFixed(2)
        a.weight = a.weight.toFixed(2);
        data.articles.push(a);
    }
    data.totalVolume = (data.totalVolume/1000).toFixed(2)
    data.totalWeight = data.totalWeight.toFixed(2);
    var tempalate = yield fs.readFile(path.resolve(__dirname,"../../../word_templates/pickup_confirmation.docx"));
    doc = new Template(template);
    doc.setData(data);
    doc.render();
    this.set("Content-Type","application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    this.body = doc.getZip().generate({type:"nodebuffer"});
}

function getStandard(entries){
    entries = entries ||[];
    for(var i = 0; i < entries.length; i++){
        var entry = entries[i];
        if(entry.standard || i == entry.length-1) return entry;
    }
    return {};
}

function calcSingleCount(type,history){
    var count = 0;
    for(var i = 0; i < history.length; i++){
        var entry = history[i];
        if(entry.type+"" == type+""){
            count += entry.count;
        }
    }
    return count;
}
