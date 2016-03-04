var async = require("async");

module.exports = function(cb){
    var self = this;
    self.db.collection("contacts").update({},{$unset:{ownedBy:true}},{multi:true},cb);
}
