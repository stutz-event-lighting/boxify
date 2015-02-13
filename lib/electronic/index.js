var async = require("async");
var HUT = require("./relais/hut.js");
var MainLight = require("./MainLight.js");
var Gate = require("./Gate.js");
var AllOff = require("./AllOff.js");

async.parallel([
    function(cb){
        var relais = new HUT("192.168.1.201",75,"admin","anel");
        relais.initialize(function(){
            cb(null,relais)
        });
    },
    function(cb){
        var relais = new HUT("192.168.1.202",76,"admin","anel");
        relais.initialize(function(){
            cb(null,relais)
        });
    }
],function(err,huts){
    if(err) throw err;
    var relais1 = huts[0];
    var relais2 = huts[1];

    var mainlight = new MainLight(relais1.ios[3],relais1.relays[4],relais1.relays[5]);
    var gate = new Gate(relais1.ios[2],relais2.ios[1],relais2.ios[0],relais1.relays[6],relais1.relays[7]);
    var alloff = new AllOff(relais1.ios[4],[relais1.relays[0],relais1.relays[1],relais1.relays[4],relais1.relays[5]]);
});
