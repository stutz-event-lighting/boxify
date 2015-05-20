var ensure = require("./ensure.js");
var cookieParser = require("cookie-parser")();

module.exports = function(permission){
    return function(req,res,next){
        console.log("ensuring");
        cookieParser(req,res,function(){
            ensure(req.app.app,req.cookies.session,permission,function(err,session){
                if(err) return res.fail();
                req.session = session;
                next();
            })
        });
    }
}
