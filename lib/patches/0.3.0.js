module.exports = function*(){
    var db = this.db;
    yield db.collection("equipmenttypes").update({contents:"*"},{$set:{contents:null}},{multi:true});
}
