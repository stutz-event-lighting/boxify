var fs = require("fs");
var mongo = require("mongodb");
module.exports = async function(){
    var db = this.db;
	await db.collection("offers").remove({},{multi:true});
}
