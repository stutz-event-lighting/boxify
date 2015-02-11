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

Client.prototype.getEquipment = function(type,id,cb){
    this.fetchJSON("/api/equipment/"+type+"/"+id,null,cb);
}

Client.prototype.saveEquipment = function(type,id,data,cb){
    this.fetch("/api/equipment/"+type+"/"+id,JSON.stringify(data),cb);
}

Client.prototype.deleteEquipment = function(type,id,cb){
    this.fetch("/api/equipment/"+type+"/"+id+"/delete",null,cb);
}
Client.prototype.deleteEquipmentType = function(id,cb){
    this.fetch("/api/equipment/"+id+"/delete",null,cb);
}

Client.prototype.getUsers = function(cb){
    this.fetchJSON("/api/users",null,cb);
}

Client.prototype.createUser = function(username,cb){
    this.fetch("/api/users/create",JSON.stringify({username:username}),cb);
}

Client.prototype.getUser = function(id,cb){
    this.fetchJSON("/api/users/"+id,null,cb);
}

Client.prototype.saveUser = function(id,data,cb){
    this.fetch("/api/users/"+id+"/save",JSON.stringify(data),cb);
}
module.exports = new Client();
