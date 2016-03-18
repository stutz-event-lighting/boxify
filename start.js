var fs = require("fs");
var Boxify = require("./lib/index.js");

var boxify = new Boxify(JSON.parse(fs.readFileSync("./config.json")+""));
boxify.start().catch(function(err){
    console.log(err.message,err.stack);
});
