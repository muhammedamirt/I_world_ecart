const userCollection = require('../models/schema/user')

module.exports = (req,res,next)=>{
    userId = req.session.user._id
    userCollection.findById(userId).then((user)=>{
        console.log(user);
        if(user){
            if(user.Access){
                next()
            }else{
                req.session.user = null
                req.session.loggedIn = false
                res.redirect('/user-login')
            }
        }
    })
}