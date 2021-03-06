var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

module.exports = function(db){
    db.Contact = db.model("contacts",{
        _id: Number,
        type:           {type:String}, //"club","company","person"
        salutation:     String,
        firstname:      String,
        lastname:       String,
        streetName:     String,
        streetNr:       String,
        zip:            String,
        city:           String,
        emails:         [{
            type: {type:String},
            email: String,
            standard: Boolean
        }],
        phones:         [{
            type: {type:String},
            number: String,
            standard: Boolean
        }],
        roles:[
            String //customer,supplier,user
        ],
        contacts:[{
            _id: {type:Number,ref:"contacts"},
            type: {type:String} //description of what kind of user it is (free text)
        }],
        remark: String,

        //only present for users
        password:       String,
        permissions: [
            String
        ],
        ahvNumber: String,
        ibanNumber: String,
        //only present for customers_read
        lastProjectNumber: Number
    });

    db.Session = db.model("sessions",{
        _id:        String,
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

    db.EquipmentType = db.model("equipmenttypes",{
        _id: 	Number,
        name: 	String, //required
        weight: Number, //optional
        height:	Number, //optional
        width:	Number, //optional
        length:	Number, //optional
        count: 	Number, //required
        manufacturer: String,
        manufacturerArticlenumber: String,
        manufacturerEAN: String,
        technicalDescription: String,
        category: {type:ObjectId, ref:"equipmentcategories"},
        tags: [String],
        rent: Number,
        factoryPrice: Number,
        accessories:[ //A description of what other equipment might be needed with this object
            {
                _id:    {type:ObjectId,ref:"equipmenttypes"},
                count:  Number,
                default:Boolean
            }
        ],
        contents:[
            {type:Number,ref:"equipmenttypes"}
        ],
        nextId: Number
    });

    db.EquipmentItem = db.model("equipment",new Schema({
        id:                 Number,
        type:               {type:Number, ref:"equipmenttypes"},
        remark:            String,
        serialnumber:       String,
        status:             String, //can be: normal, defective, lost, deleted
        contents: Mixed/*{
            TYPE:{
                count:  Number,
                ids:    [
                    Number
                ]
            }
        }*/,
    },{minimize:false}));

    db.EquipmentLog = db.model("equipmentlogs",{
        time:       Number,
        type:       {type:Number, ref:"equipmenttypes"},
        id:         Number, //eiter count or id, not both
        count:      Number,
        event:      String, //can be: added, broke, repaired, lost, found, maintenance, removed
        job:        Number
    });

    db.Project = db.model("projects",new Schema({
        customer:   {type:Number,ref:"contacts"},
        projectNumber: Number,
        name:       String,
        remark:     String,
        start:      Number,
        end:        Number,
        status:     String, //can be draft, offered, rejected,
        reserved:Mixed /*{
            TYPE: Number
        }*/,
        balance:Mixed/*{
            TYPE:{
                count: Number, //must not be <= 0
                suupliers:{ //optional
                    SUPPLIER: Number
                }
            }
        }*/
    },{minimize:false}));

    db.EquipmentRental = db.model("equipmentrentals",new Schema({
        name:       String,
        projects:    [{type:ObjectId,ref:"projects"}],
        supplier:   {type:Number,ref:"contacts"},
        status:     String, //requested, booked, received, returned
        delivery:   Number,
        return:     Number,
        items:Mixed/*{
            TYPE:{
                count: Number,
                ids: [String] //only present if the status is received or returned & each item has its own id
            }
        }*/
    },{minimize:false}));

    db.EquipmentIo = db.model("equipmentio",new Schema({
        project:    {type:ObjectId,ref:"projects"},
        type:       String, //checkout, checkin
        draft:      Boolean,
        reservation:{type:ObjectId,ref:"equipmentreservations"}, //only available when it's a draft!
        time:       Number, // only present when not a draft
        user:       {type:Number,ref:"contacts"}, // only present when not a draft
        person:     {type:Number,ref:"contacts"}, //person picking up or receiving / returning equipment
        delivered:  Boolean, //out: true when deliviered, false when picked up by the customer, in: true when picked up by us, false when returned by the customer
        items:Mixed/*{
            TYPE:{
                count:  Number,
                suppliers:{
                    SUPPLIER:{
                        count: Number,
                        ids:[String] //optional
                    }
                }
            }
        }*/,
        history:Mixed/*[
            {//ENTRY
                supplier: "SUPPLIER", //required
                type: TYPE, //required
                count: //required
                items: { //required for types with hasItems:true and supplier:'own'
                    ITEM: [
                        ENTRY
                    ]
                }
            }
        ]*/
    },{minimize:false}),"equipmentio")

    db.EquipmentReservation = db.model("equipmentreservations",new Schema({
        project:    {type:ObjectId,ref:"projects"},
        items:Mixed/*{
            TYPE:   Number
        }*/
    },{minimize:false}))

    db.EquipmentTag = db.model("equipmenttag",{
        _id: String
    });

    db.EquipmentCategory = db.model("equipmentcategories",{
        name:String
    })

    var Discounts = Mixed;

    var Section = {
        items: [{
            _id:false,
            section: String,
            name: String,
            count: Number,
            rate: Number,
            type: {type:Number,ref:"equipmenttypes"},
            category: {type:ObjectId,ref:"equipmentcategories"}
        }],
        discounts: Discounts
    }

    db.Offer = db.model("offers",{
        project: ObjectId,
        location: String,
        date: Number,
        expiration: Number,
        person: {
            type:Number,
            ref: "contacts"
        },
        user: {
            type: Number,
            ref: "contacts"
        },
        projects:[{
            _id:false,
            name: String,
    		deliveryType: String, //delivery or pickup
    		deliveryDate: Number,
    		deliveryLocation: String,
    		returnType: String, //pickup or delivery
    		returnDate: Number,
            servicesUs: String,
            servicesCustomer: String,
            factor: Number,
            sections:{
                consumables: Section,
                equipment: Section,
                services: Section,
                transportation: Section
            },
            discounts: Discounts,
        }],
        discounts: Discounts,
        total:Number
    })
}
