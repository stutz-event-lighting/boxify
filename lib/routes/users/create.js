module.exports = function(req,res){
    req.app.db.collection("users").insert({firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email,password:req.body.password,permissions:[]},function(err,data){
        if(err) return res.fail();
        res.end(data[0]._id+"");
    })
}
