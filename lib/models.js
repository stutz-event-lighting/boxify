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
        comment: String,

        //only present for users
        password:       String,
        pin:            String,
        ownedBy:        [
            {type:ObjectId,ref:"contacts"}
        ],
        permissions: [
            String
        ],
        //only present for customers_read
        lastProjectNumber: Number
    });
}
