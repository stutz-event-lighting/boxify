var async = require("async");
var mongo = require("mongodb");
var moment = require("moment");
var Template = require("docxtemplater");
var fs = require("fs");
var path = require("path");

module.exports = function(req,res){
    var _id = mongo.ObjectID(req.params.io);
    req.app.db.collection("equipmentio").findOne({_id:_id},{project:true,time:true,items:true,history:true},function(err,checkout){
        if(err) return res.fail();

        var articleIds = Object.keys(checkout.items).map(function(id){return parseFloat(id)});

        async.parallel([
            function(cb){
                req.app.db.collection("projects").findOne({_id:checkout.project},{customer:true,name:true,start:true,end:true},cb);
            },
            function(cb){
                req.app.db.collection("equipmenttypes").find({_id:{$in:articleIds}}).toArray(cb)
            }
        ],function(err,results){
            if(err) return res.fail();

            var project = results[0];
            var articles = results[1];

            req.app.db.collection("contacts").findOne({_id:project.customer},{type:true,salutation:true,firstname:true,
                lastname:true,streetName:true,streetNr:true,zip:true,city:true,emails:true,phone:true},function(err,customer){

                var data = {
                    project_id:project._id+"",
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
                    person:[
                        customer.firstname,
                        customer.lastname,
                        getStandard(customer.phones).number,
                        getStandard(customer.emails).email
                    ].filter(function(val){return val}).join("\r\n"),
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
                fs.readFile(path.resolve(__dirname,"../../../../word_templates/pickup_confirmation.docx"),function(err,template){
                    if(err) return res.fail();
                    doc = new Template(template);
                    doc.setData(data);
                    doc.render();
                    res.writeHead(200,"OK",{"Content-Type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
                    res.end(doc.getZip().generate({type:"nodebuffer"}));
                })
            });
        })
    });
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
