const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bannerSchema = new Schema({
    Description :{
        type:String,
        require:true
    },
    category:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    }
})
module.exports = mongoose.model('banner',bannerSchema)