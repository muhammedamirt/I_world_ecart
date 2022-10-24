const mongoose = require('mongoose')

const Schema = mongoose.Schema

const wishlistSchema = new Schema({
    userId:{
        type:String,
        require:true
    },
    productId:{
        type:Array,
        require:true
    }
})
module.exports = mongoose.model('wishlist',wishlistSchema)