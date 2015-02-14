var net = require("net");
var byline = require("byline");
module.exports = function(c){
    var con = net.connect(10000,function(){
        byline(con).on("data",function(line){
            c.send(line+"\r\n");
        });
        con.on("end",function(){
            c.close();
        });
        con.on("error",function(){})
        con.write(JSON.stringify({username:"admin",password:"1234"})+"\r\n");
        c.on("message",function(msg){
            con.write(msg+"\r\n");
        })
        c.on("close",function(){
            con.end();
        })
        c.on("error",function(){})
    });
}
