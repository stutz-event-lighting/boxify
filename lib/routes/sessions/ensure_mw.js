var ensure = require("./ensure.js");
var cookieParser = require("cookie-parser")();

module.exports = function(permission){
    return function(req,res,next){
        cookieParser(req,res,function(){
            ensure(req.app.app,req.cookies.session,permission,function(err){
                if(err) return res.fail();
                next();
            })
        });
    }
}
