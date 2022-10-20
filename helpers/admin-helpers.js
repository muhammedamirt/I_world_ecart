const { resolve } = require('path')
const userCollection = require('../models/schema/user')
const productCollection = require('../models/schema/products')
const adminCollection = require('../models/schema/admin')
const orderColeection = require('../models/schema/order')

module.exports = {
    getUserDetailes: () => {
        return new Promise((res, rej) => {
            userCollection.find((err, data) => {
                if (!err) {
                    res(data)
                } else {
                    console.log(err);
                }
            }).lean()
        })
    },


    getProducts: () => {
        return new Promise((res, rej) => {
            productCollection.find((err, data) => {
                if (!err) {
                    res(data)
                } else {
                    console.log(err);
                }
            }).lean()
        })
    },


    doAdminLogin: (loginData) => {
        // console.log(loginData);
        Email = loginData.Email
        console.log(("=================="));
        // console.log(loginData);
        return new Promise((res, rej) => {

            adminCollection.findOne({ Email: Email }, ((err, data) => {
                //  console.log(data);
                if (data) {
                    let response = {}
                    if (data.Password == loginData.Password) {
                        response.adminData = data
                        response.status = true
                        // console.log(response.adminData);
                        res(response)
                    } else {
                        console.log('Password Error');
                        rej({ passwordErr: true })
                    }
                } else {
                    console.log('Email error');
                    rej({ emailErr: true })
                }
            })

            )
        })

    },


    blockUserAccount: (userId) => {
        return new Promise((res, rej) => {
            userCollection.updateOne({ _id: userId }, {
                $set: {
                    Access: false
                }
            }).then((data) => {
                res(data)
            })
        })
    },


    unblockUserAccount: (userId) => {
        return new Promise((res, rej) => {
            userCollection.updateOne({ _id: userId }, {
                $set: {
                    Access: true
                }
            }).then((data) => {
                res(data)
            })
        })
    },


    getAllOrders: () => {
        return new Promise((res, rej) => {
            orderColeection.findOne()
                .lean()
                .then((data) => {
                    let orderData = data.orders
                    res(orderData)
                })
        })

    },

    getOneUserOrder: (userId) => {
        return new Promise(async (res, rej) => {
            let admin = await adminCollection.findOne()
            let adminId = admin._id
            orderColeection.findOne({ adminId: adminId })
            .lean()
            .then((data) => {
                // console.log(data);
                console.log(userId);
                let userIndex = data.orders.findIndex(p => p.userId == userId);
                console.log(userIndex);
                if (userIndex >= 0) {
                    let userOrder = data.orders[userIndex]
                    // console.log(userOrder);
                    // console.log(products);
                    // console.log(products.productImages);
                    res(userOrder)
                } else {

                }
            })

        })

    }

}