const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    UserName : {
        type : String,
        required : true
    },
    Mobile: {
        type: Number,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Access:{
        type : Boolean,
        require: true
    },
    address:{
        type:String,
        require:true
    }
})

module.exports = mongoose.model('user',userSchema)