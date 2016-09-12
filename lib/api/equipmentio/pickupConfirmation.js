"use strict";

var mongo = require("mongodb");
var moment = require("moment");
var Template = require("docxtemplater");
var fs = require("fs-promise");
var path = require("path");

module.exports = function _callee(ctx) {
    var _id, checkout, articleIds, articles, project, person, customer, data, i, article, volume, a, tempalate;

    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _id = mongo.ObjectID(ctx.params.io);
                    _context.next = 3;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentIo.findOne({ _id: _id }).select("project time items history person").populate("project", "projectNumber customer name start end").populate("person", "firstname lastname emails phones").populate("customer", "type salutation firstname lastname streetName streetNr zip city emails phones"));

                case 3:
                    checkout = _context.sent;
                    articleIds = Object.keys(checkout.items).map(function (id) {
                        return parseFloat(id);
                    });
                    _context.next = 7;
                    return regeneratorRuntime.awrap(ctx.app.db.EquipmentType.find({ _id: { $in: articleIds } }));

                case 7:
                    articles = _context.sent;
                    project = checkout.project;
                    person = checkout.person;
                    customer = checkout.customer;
                    data = {
                        project_id: project.projectNumber,
                        project_name: project.name,
                        project_start: moment(project.start).format("DD.MM.YYYY"),
                        project_end: moment(project.end).format("DD.MM.YYYY"),
                        customer_id: customer._id + "",
                        customer: [customer.firstname, [customer.streetName, customer.streetNr].filter(function (val) {
                            return val;
                        }).join(" "), [customer.zip, customer.city].filter(function (val) {
                            return val;
                        }).join(" "), "Schweiz", getStandard(customer.phones).number, getStandard(customer.emails).email].filter(function (val) {
                            return val;
                        }).join("\r\n"),
                        person: person ? [person.firstname, person.lastname, getStandard(person.phones).number, getStandard(person.emails).email].filter(function (val) {
                            return val;
                        }).join("\r\n") : "",
                        articles: [],
                        totalCount: 0,
                        totalVolume: 0,
                        totalWeight: 0
                    };


                    for (i = 0; i < articles.length; i++) {
                        article = articles[i];
                        volume = article.height > 0 && article.width > 0 && article.length > 0 ? article.height * article.width * article.length : 0;
                        a = {
                            name: [article.name, article.technicalDescription].filter(function (val) {
                                return val;
                            }).join("\r\n"),
                            count: checkout.items[article._id + ""].count,
                            volume: volume * calcSingleCount(article._id, checkout.history),
                            weight: (article.weight > 0 ? article.weight : 0) * checkout.items[article._id + ""].count
                        };


                        data.totalVolume += a.volume;
                        data.totalWeight += a.weight;
                        data.totalCount += a.count;
                        a.volume = (a.volume / 1000).toFixed(2);
                        a.weight = a.weight.toFixed(2);
                        data.articles.push(a);
                    }
                    data.totalVolume = (data.totalVolume / 1000).toFixed(2);
                    data.totalWeight = data.totalWeight.toFixed(2);
                    _context.next = 17;
                    return regeneratorRuntime.awrap(fs.readFile(path.resolve(__dirname, "../../../word_templates/pickup_confirmation.docx")));

                case 17:
                    tempalate = _context.sent;

                    doc = new Template(template);
                    doc.setData(data);
                    doc.render();
                    ctx.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                    ctx.body = doc.getZip().generate({ type: "nodebuffer" });

                case 23:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};

function getStandard(entries) {
    entries = entries || [];
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.standard || i == entry.length - 1) return entry;
    }
    return {};
}

function calcSingleCount(type, history) {
    var count = 0;
    for (var i = 0; i < history.length; i++) {
        var entry = history[i];
        if (entry.type + "" == type + "") {
            count += entry.count;
        }
    }
    return count;
}