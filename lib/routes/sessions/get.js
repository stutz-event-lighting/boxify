module.exports = function(boxify,id,cb){
    boxify.db.collection("sessions").findOne({_id:id},{user:true,permissions:true},function(err,session){
        if(err) return cb(err);
        if(!session) return cb(new Error("Invalid session id"));
        cb(null,session);
    });
}
