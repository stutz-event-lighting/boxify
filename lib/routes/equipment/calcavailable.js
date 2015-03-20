var async = require("async");
var calcBalance = require("./calculatetotalbalance.js");
var calcNeeds = require("./calculatemaxneeds.js");

module.exports = function(db,start,end,cb){
    async.parallel([
        function(cb){
            calcBalance(db,cb)
        },
        function(cb){
            calcNeeds(db,start,end,cb)
        }
    ],function(err,results){
        
    })
}
