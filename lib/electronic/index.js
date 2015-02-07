var async = require("async");
var HUT = require("./relais/hut.js");
var MainLight = require("./MainLight.js");
var Door = require("./Door.js");
var AllOff = require("./AllOff.js");

async.parallel([
    function(cb){
        var relais = new HUT("192.168.1.201",75,"admin","anel");
        relais.initialize(function(){
            cb(null,relais)
        });
    },
    function(cb){
        var relais = new HUT("192.168.1.202",75,"admin","anel");
        relais.initialize(function(){
            cb(null,relais)
        });
    }
],function(err,huts){
    if(err) throw err;
    var relais1 = huts[0];
    var relais2 = huts[1];

    var mainlight = new MainLight(relais1.ios[3],relais1.relays[4],relais1.relays[5]);
    //var door = new Door(relais1.ios[2],relais1.relays[6],relais1.relays[7]);
    //var alloff = new AllOff(relais1.ios[4],[relais1.relays[0],relais1.relays[1],relais1.relays[4],relais1.relays[5]]);
});
