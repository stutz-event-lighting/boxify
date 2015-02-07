var AllOff = module.exports = function(button,ligths){
    button.on("change",function(){
        if(!button.value){
            for(var i = 0; i < lights.length; i++){
                lights[i].set(false,function(){})
            }
        }
    })
}
