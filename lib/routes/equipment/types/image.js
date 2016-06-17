var mongo = require("mongodb");

module.exports = function*(){
    var store = new mongo.GridStore(this.app.db,parseFloat(this.params.id),parseFloat(this.params.id),"r",{root:"equipmentimages"});
    try{
        yield store.open();
        var data = yield store.read();
        yield store.close();
    }catch(e){
        this.status = 302;
        this.set("Location","http://placehold.it/350x250");
        return;
    }
    this.set("Content-Type","image/jpeg");
    this.body = data;
}
