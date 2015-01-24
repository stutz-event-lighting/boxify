function Client(){

}
Client.prototype.fetch = function(url,data,cb){
    var req = new XMLHttpRequest();
    req.open(data?"POST":"GET",url);
    req.setRequestHeader("Content-Type","application/json");
    req.onreadystatechange = function(){
        if(req.readyState == 4){
            console.log("OMG");
            if(req.status != 200){
                var err = new Error(req.status+" - "+req.statusMessage);
                err.code = req.status;
                cb(err);
            }else{
                cb(null,req.responseText);
            }
        }
    }
    req.send(data);
}
Client.prototype.fetchJSON = function(url,data,cb){
    this.fetch(url,data,function(err,data){
        if(err) return cb(err);
        try{
            data = JSON.parse(data);
        }catch(e){
            return cb(new Error("Got invalid JSON"));
        }
        cb(null,data);
    })
}

Client.prototype.findEquipmentTypes = function(opts,cb){
    this.fetchJSON("/api/equipment",JSON.stringify(opts),cb);
}

Client.prototype.createEquipmentType = function(opts,cb){
    console.log("OPTS",opts)
    this.fetch("/api/equipment/create",JSON.stringify(opts),cb);
}

Client.prototype.getEquipmentType = function(id,cb){
    this.fetchJSON("/api/equipment/"+id,null,cb);
}

Client.prototype.saveEquipmentType = function(id,data,cb){
    this.fetch("/api/equipment/"+id,JSON.stringify(data),cb);
}

Client.prototype.increaseEquipmentCount = function(id,data,cb){
    this.fetch("/api/equipment/"+id+"/count",JSON.stringify(data),cb);
}

Client.prototype.createEquipment = function(type,opts,cb){
    this.fetch("/api/equipment/"+type+"/create",JSON.stringify(opts),cb);
}

Client.prototype.saveEquipment = function(type,id,data,cb){
    this.fetch("/api/equipment/"+type+"/"+id,JSON.stringify(data),cb);
}

Client.prototype.deleteEquipment = function(type,id,cb){
    this.fetch("/api/equipment/"+type+"/"+id+"/delete",null,cb);
}

module.exports = new Client();
