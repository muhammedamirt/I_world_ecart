const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
    ProductName : {
        type : String,
        required : true
    },
    Price : {
        type :String,
        required : true
    },
    Description : {
        type : String,
        required : true
    },
    Categury : {
        type :String,
        required : true
    },
    images:{
        type : Array,
        required:true
    },
    stock:{
        type:String,
        required :true
    }

})

module.exports = mongoose.model('product',productSchema)
   
