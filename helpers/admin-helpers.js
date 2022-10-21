const { resolve } = require('path')
const userCollection = require('../models/schema/user')
const productCollection = require('../models/schema/products')
const adminCollection = require('../models/schema/admin')
const orderCollection = require('../models/schema/order')
const mongoose = require('mongoose')

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
            orderCollection.aggregate([
                {
                    $unwind: "$orders"
                },
                {
                    $project: { orders: 1 }
                },
                {
                    $sort: { "orders.date": 1 }
                }
            ]).then((data) => {
                // console.log(data)
                res(data)
            })
        })

    },

    getOneUserOrder: (orderId) => {
        return new Promise(async (res, rej) => {
            let id = mongoose.Types.ObjectId(orderId)
            orderCollection.aggregate([
                {
                    $unwind: "$orders"
                },
                {
                    $project: {
                        orders: 1
                    }
                },
                {
                    $match: {
                        "orders._id": id
                    }
                }
            ]).then((data) => {
                console.log(data);
                res(data)
            })
        })

    }

}