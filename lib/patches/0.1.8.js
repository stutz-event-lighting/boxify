var async = require("async");

module.exports = function(cb){
    var self = this;
    self.db.collection("projects").find().sort({_id:1}).toArray(function(err,projects){
        var byCustomer = {};
        async.eachSeries(projects,function(project,cb){
            if(!byCustomer[project.customer]) byCustomer[project.customer] = 0;
            self.db.collection("projects").update({_id:project._id},{$set:{projectNumber:++byCustomer[project.customer]}},cb);
        },function(err){
            async.eachSeries(Object.keys(byCustomer),function(customer,cb){
                console.log("updating customer",customer,byCustomer[customer])
                self.db.collection("contacts").update({_id:parseFloat(customer)},{$set:{lastProjectNumber:byCustomer[customer]}},cb);
            },cb);
        })
    });
}
