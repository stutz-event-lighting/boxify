var async = require("async");
var MainLight = module.exports = function MainLight(io,half,full){
    this.io = io;
    this.half = half;
    this.full = full;
    this.timeout = null;
    io.on("change",function(){
        if(io.value){
            this.timeout = setTimeout(function(){
                this.timeout = null;
                this.long();
            }.bind(this),1000);
        }else{
            if(this.timeout){
                clearTimeout(this.timeout);
                this.timeout = null;
                this.short();
            }
        }
    }.bind(this));
}

MainLight.prototype.short = function(){
    if(this.half.value){
        if(this.full.value){
            this.turnOff(function(){})
        }else{
            this.full.set(true,function(){})
        }
    }else{
        this.half.set(true,function(){})
    }
}

MainLight.prototype.long = function(){
    if(this.half.value){
        if(this.full.value){
            this.full.set(false,function(){})
        }else{
            this.half.set(false,function(){})
        }
    }else{
        this.turnOn(function(){});
    }
}

MainLight.prototype.turnOff = function(cb){
    var self = this;
    async.parallel([
        function(cb){
            self.half.set(false,cb);
        },
        function(cb){
            self.full.set(false,cb);
        }
    ],cb)
}

MainLight.prototype.turnHalfOn = function(cb){
    var self = this;
    async.parallel([
        function(cb){
            self.half.set(true,cb);
        },
        function(cb){
            self.full.set(false,cb);
        }
    ],cb)
}

MainLight.prototype.turnOn = function(cb){
    var self = this;
    async.parallel([
        function(cb){
            self.half.set(true,cb);
        },
        function(cb){
            self.full.set(true,cb);
        }
    ],cb)
}
