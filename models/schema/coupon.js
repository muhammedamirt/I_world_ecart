const mongoose = require('mongoose')

const Schema = mongoose.Schema

const couponSchema = new Schema({
    couponName :{
        type:String,
        required : true
    },
    discount:{
        type:String,
        required:true
    },
    quantity:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required :true
    },
    validity:{
        type:String,
        required : true
    },
    couponCode:{
        type:String,
        required : true
    },
    maximumPurchase:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('coupon',couponSchema)