module.exports = async function(){
    var db = this.db;
    var actions = [];
    await new Promise(function(success,fail){
        db.collection("settings").find({}).toArray(function(err,settings){
            for(var i = 0; i < settings.length; i++){
                var s = settings[i];
                switch(s._id){
                    case "nextContactID":
                        actions.push(db.MainSettings.update({_id:"main"},{$set:{"nextContactId":s.value}}));
                        break;
                    case "nextEquipmenttypeID":
                        actions.push(db.MainSettings.update({_id:"main"},{$set:{"nextEquipmenttypeId":s.value}}));
                        break;
                }
            }
            db.collection("settings").remove({_id:{$ne:"main"}},success);
        });
    });
    await actions;
    await new Promise(function(success){
        db.collection("contacts").update({},{$unset:{pin:true},$rename:{comment:"remark"}},{multi:true},success)
    });
    await new Promise(function(success){
        db.collection("projects").update({},{$rename:{comment:"remark"}},{multi:true},success)
    });
    await new Promise(function(success){
        db.collection("equipment").update({},{$rename:{comment:"remark"}},{multi:true},success)
    });
}
