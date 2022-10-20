const mongoose = require('mongoose')
const { type } = require('os')

const Schema = mongoose.Schema

const productSchema = new Schema({
    productId :{
        type : String,
        require :true
    },
    productName:{
        type : String,
        require : true
    },
    ProductQuantity:{
        type : String,
        require : true
    },
    productPrice : {
        type : String,
        require:true
    },
    TotalPrice : {
        type : String,
        require : true
    },
    productImages :{
        type : Array,
        require:true
    }
})

const cartSchema = new Schema({
    userId : {
        type : String,
        require : true
    },
    totalAmount : {
        type :String,
        require : true 
    },
    cartItems : [productSchema]

})

module.exports = mongoose.model('carts',cartSchema)
