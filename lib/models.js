var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = function(db){
    db.Contact = db.model("contacts",{
        _id: Number,
        type:           String, //"club","company","person"
        salutation:     String,
        firstname:      String,
        lastname:       String,
        streetName:     String,
        streetNr:       String,
        zip:            String,
        city:           String,
        emails:         [{
            type: String,
            email: String,
            standard: Boolean
        }],
        phones:         [{
            type: String,
            number: String,
            standard: Boolean
        }],
        roles:[
            String //customer,supplier,user
        ],
        contacts:[{
            _id: {type:ObjectId,ref:"contacts"},
            type: String //description of what kind of user it is (free text)
        }],
        remark: String,

        //only present for users
        password:       String,
        permissions: [
            String
        ],
        //only present for customers_read
        lastProjectNumber: Number
    });

    db.Session = db.model("sessions",{
        _id:        ObjectId,
        user:       Number,
        permissions:[
            String
        ]
    });

    db.Settings = db.model("settings",{
        _id:String
    });
    db.MainSettings = db.Settings.discriminator("main",new mongoose.Schema({
        _id:String,
        version: String,
        nextContactId: Number,
        nextEquipmenttypeId: Number
    }));
}
