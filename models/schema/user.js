const mongoose = require('mongoose')

const Schema = mongoose.Schema

const addressSchema = new Schema({
    firstName:{
        type : String,
        require : true
    },
    lastName:{
        type:String,
        require:true
    },
    address:{
        type:String,
        require:true
    },
    Email:{
        type:String,
        require:true
    },
    Mobile:{
        type:String,
        require:true
    }
})

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
    address:[addressSchema],
    coupon:{
        type:Array,
        
    }
})

module.exports = mongoose.model('user',userSchema)