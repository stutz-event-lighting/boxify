var EventEmitter = require("events").EventEmitter;

class BarcodeScanner extends EventEmitter{
    constructor(){
        super();
        this.code = "";
        this.onKeyDown = this.onKeyDown.bind(this);
        this.patterns = [
            [/^EQ\-([0-9]+)$/,function(v){return {kind:"EQ",type:parseFloat(v[0])}}],
            [/^EQ\-([0-9]+)\:([0-9]+)$/,function(v){return {kind:"EQ",type:parseFloat(v[0]),count:parseFloat(v[1])}}],
            [/^EQ\-([0-9]+)\-([0-9]+)$/,function(v){return {kind:"EQ",type:parseFloat(v[0]),item:parseFloat(v[1])}}],
            [/^EQ\-([0-9]+)\-([0-9]+)\:([0-9]+)$/,function(v){return {kind:"EQ",type:parseFloat(v[0]),item:parseFloat(v[1]),count:parseFloat(v[2])}}]
        ];
    }
    start(){
        document.addEventListener("keypress",this.onKeyDown);
    }

    onKeyDown(e){
        if(document.activeElement == document.body){
            if(e.keyCode == 13){
                this.parse(this.code);
                this.code = "";
            }else{
                this.code += String.fromCharCode(e.which);
            }
        }
    }

    parse(string){
        var code = string.replace(/\'/g,"-").replace(/é/g,":").toUpperCase();
        for(var i = 0; i < this.patterns.length; i++){
            var pattern = this.patterns[i];
            var values = code.match(pattern[0]);
            if(values){
                this.emit("scan",pattern[1](values.slice(1)));
                break;
            }
        }
    }

    stop(){
        document.removeEventListener("keypress",this.onKeyDown);
    }
}


module.exports = new BarcodeScanner();
