const productCollection = require("../models/schema/products");
const userCollection = require('../models/schema/user')
const categuryCollection = require('../models/schema/categury')
const bannerCollection = require('../models/schema/banners')
const AdminCollection = require('../models/schema/admin')
const orderCollection = require('../models/schema/order')


module.exports = async (data, dataBase) => {

    if (AdminCollection === dataBase) {

        if (await AdminCollection.findOne({ data })) {
            return true
        } else {
            return false
        }
    }
    else if (bannerCollection === dataBase) {

        if (await bannerCollection.findOne({ data })) {
            return true
        } else {
            return false
        }

    }
    else if (userCollection === dataBase) {

        if (await userCollection.findOne({ data })) {
            return true
        } else {
            return false
        }

    }
    else if (categuryCollection === dataBase) {

        if (await categuryCollection.findOne({ data })) {
            return true
        } else {
            return false
        }

    } else if (productCollection === dataBase) {

        if (await productCollection.findOne({ data })) {
            return true
        } else {
            return false
        }

    }

}