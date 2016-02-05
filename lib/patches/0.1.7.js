var async = require("async");

module.exports = function(cb){
    var self = this;
    self.db.collection("contacts").find({}).sort({_id:1}).toArray(function(err,contacts){
        var index = {};
        for(var i = 0; i < contacts.length; i++) index[contacts[i]._id+""] = i+1;

        async.series([
            function(cb){
                async.each(contacts,function(contact,cb){
                    var oldid = contact._id;
                    contact._id = index[contact._id+""];
                    contact.oldid = oldid;
                    if(contact.contacts){
                        for(var i = 0; i < contact.contacts.length; i++) contact.contacts[i]._id = index[contact.contacts[i]._id+""];
                    }
                    if(contact.ownedBy){
                        for(var i = 0; i < contact.ownedBy.length; i++) contact.ownedBy[i] = index[contact.ownedBy[i]+""];
                    }
                    async.parallel([
                        function(cb) {
                            self.db.collection("contacts").insert(contact,cb);
                        },
                        function(cb){
                            self.db.collection("contacts").remove({_id:oldid},cb)
                        }
                    ],function(err){
                        if(err) return cb(err);
                        contact._id = oldid;
                        cb();
                    })
                },cb);
            },
            function(cb){
                self.db.collection("contacts.files").find({}).toArray(function(err,files){
                    async.each(files,function(file,cb){
                        var oldid = file._id;
                        file._id = index[file._id+""];
                        async.parallel([
                            function(cb) {
                                self.db.collection("contacts.files").insert(file,cb);
                            },
                            function(cb){
                                self.db.collection("contacts.files").remove({_id:oldid},cb)
                            },
                            function(cb){
                                self.db.collection("contacts.chunks").update({files_id:oldid},{$set:{files_id:file._id}},{multi:true},cb);
                            }
                        ],cb);
                    },cb);
                })
            },
            function(cb){
                self.db.collection("projects").find({}).toArray(function(err,projects){
                    async.each(projects,function(project,cb){
                        project.customer = index[project.customer+""];
                        for(var type in project.balance){
                            type = project.balance[type];
                            for(var supplier in type.suppliers){
                                if(supplier == "own") continue;
                                type.suppliers[index[supplier]] = type.suppliers[supplier];
                                delete type.suppliers[supplier];
                            }
                        }
                        self.db.collection("projects").update({_id:project._id},project,cb);
                    },cb);
                })
            },
            function(cb){
                self.db.collection("equipmentrentals").find({}).toArray(function(err,rentals){
                    async.each(rentals,function(rental,cb){
                        rental.supplier = index[rental.supplier+""]
                        self.db.collection("equipmentrentals").update({_id:rental._id},rental,cb);
                    },cb);
                })
            },
            function(cb){
                self.db.collection("equipmentio").find({}).toArray(function(err,ios){
                    async.each(ios,function(io,cb){
                        io.user = index[io.user+""];
                        if(io.person) io.person = index[io.person+""];
                        for(var type in io.items){
                            type = io.items[type];
                            for(var supplier in type.suppliers){
                                if(supplier == "own") continue;
                                type.suppliers[index[supplier]] = type.suppliers[supplier];
                                delete type.suppliers[supplier];
                            }
                        }
                        if(io.history){
                            for(var i = 0; i < io.history.length; i++) {
                                if(io.history[i].supplier != "own") io.history[i].supplier = index[io.history[i].supplier+""];
                            }
                        }
                        self.db.collection("equipmentio").update({_id:io._id},io,cb);
                    },cb);
                });
            },
            function(cb){
                self.db.collection("sessions").find({}).toArray(function(err,sessions){
                    async.each(sessions,function(session,cb){
                        session.user = index[session.user+""];
                        self.db.collection("sessions").update({_id:session._id},session,cb);
                    },cb);
                })
            }
        ],function(err){
            if(err) return cb(err);
            self.db.collection("settings").insert({_id:"nextContactID",value:i+1},function(err){
                if(err) return cb(err);
                self.db.collection("idcounters").findOne({collection:"equipmenttypes"},{},function(err,counter){
                    if(err) return cb(err);
                    self.db.collection("settings").insert({_id:"nextEquipmenttypeID",value:counter.nextId},function(err){
                        if(err) return cb(err);
                        self.db.dropCollection("idcounters",cb);
                    })
                })
            })
        });
    });
}
