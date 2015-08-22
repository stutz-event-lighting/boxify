var cookieParser = require("cookie-parser")();
module.exports = function(req,res){
    cookieParser(req,res,function(){
        req.app.db.collection("sessions").remove({_id:req.cookies.session},function(err){
            if(err) return res.fail();
            res.end();
        })
    });
}
