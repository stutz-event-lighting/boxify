var Gate = module.exports = function Gate(io,io_open,io_closed,open,close){
    this.state = "standing";
    this.direction = "up";
    this.io = io;
    this.io_open = io_open;
    this.io_closed = io_closed;
    this.open = open;
    this.close = close;
    this.inaction = false;

    this.io.on("change",function(){
        if(!this.io.value){
            this.press();
        }
    }.bind(this));
    this.io_open.on("change",function(){
        if(!this.io_open.value){
            this.state = "standing";
            this.direction = "up";
        }
    }.bind(this))
    this.io_closed.on("change",function(){
        if(!this.io_closed.value){
            this.state = "standing";
            this.direction = "down";
        }
    }.bind(this))
}

Gate.prototype.press = function(){
    switch(this.state){
        case "standing":
            if(this.direction == "up"){
                this.impulse(this.open,"opening","down");
            }else{
                this.impulse(this.close,"closing","up");
            }
            break;
        case "opening":
            this.impulse(this.close,"standing","down");
            break;
        case "closing":
            this.impulse(this.open,"standing","up");
            break;
    }
}

Gate.prototype.impulse = function(relay,state,direction){
    if(this.inaction) return;
    this.inaction = true;
    relay.set(true,function(){
        relay.set(false,function(){
            this.state = state;
            this.inaction = false;
            this.direction = direction;
        }.bind(this));
    }.bind(this));
}
