var Door = module.exports = function Door(io,open,close){
    this.state = "standing";
    this.direction = "up";
    this.io = io;
    this.open = open;
    this.close = close;
    this.inaction = false;

    this.io.on("change",function(){
        if(!this.io.value){
            this.press();
        }
    }.bind(this))
}

Door.prototype.press = function(){
    switch(this.state){
        case "standing":
            if(this.direction == "up"){
                console.log("open");
                this.impulse(this.open,"opening","down");
            }else{
                console.log("close");
                this.impulse(this.close,"closing","up");
            }
            break;
        case "opening":
            console.log("stop opening")
            this.impulse(this.close,"standing","down");
            break;
        case "closing":
            console.log("stop closing")
            this.impulse(this.open,"standing","up");
            break;
    }
}

Door.prototype.impulse = function(relay,state,direction){
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
