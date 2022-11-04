const mongoose = require('mongoose')
const { type } = require('os')
const { array } = require('../../middlewares/multer')

const Schema = mongoose.Schema

const orderDetailes = new Schema({
    date: {
        type: String,
        require: true
    },
    userName: {
        type: String,
        require: true
    },
    userId: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    userMobile: {
        type: String,
        require:true
    },
    products: {
        type: Array,
        require: true
    },
    totalAmount: {
        type: Number,
        require: true
    },
    paymentType:{
        type:String,
        require:true
    },
    paymentStatus:{
        type:String,
        require:true
    }
})

const orderSchema = new Schema({
    userId:{
        type:String,
        require:true
    },
    orders: [orderDetailes]


})

module.exports = mongoose.model('orders',orderSchema)
