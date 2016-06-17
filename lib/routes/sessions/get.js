module.exports = function*(db,id){
    return yield db.Session.findOne({_id:id}).select("user permissions");
}
