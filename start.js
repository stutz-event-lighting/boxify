var fs = require("fs");
var Boxify = require("./lib/index.js");

var boxify = new Boxify(JSON.parse(fs.readFileSync("./config.json")+""));
boxify.start();
