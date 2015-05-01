var get = require("./get.js");
var cookieParser = require("cookie-parser")();

module.exports = function(req,res,next){
    cookieParser(req,res,function(){
        get(req.app.app,req.cokies.session,function(err,session){
            if(err) return res.fail();
            req.session = session;
            next();
        });
    });
}
