module.exports = async function(){
    var db = this.db;
    await db.collection("equipmenttypes").update({contents:"*"},{$set:{contents:null}},{multi:true});
}
