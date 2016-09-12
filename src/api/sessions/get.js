module.exports = async function(db,id){
    return await db.Session.findOne({_id:id}).select("user permissions");
}
