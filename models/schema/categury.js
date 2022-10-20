const mongoose = require('mongoose')

const Schema = mongoose.Schema

const categurySchema = new Schema({
    categuryName : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('categury',categurySchema)