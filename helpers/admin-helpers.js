const userCollection = require('../models/schema/user')
const productCollection = require('../models/schema/products')
const adminCollection = require('../models/schema/admin')
const orderCollection = require('../models/schema/order')
const couponCollection = require('../models/schema/coupon')
const bannerCollection = require('../models/schema/banners')
const mongoose = require('mongoose')

const couponCodeGenerator = require('otp-generator');
const codeGen = couponCodeGenerator.generate(8, { upperCaseAlphabets: false, specialChars: false });


module.exports = {
    getUserDetailes: () => {
        return new Promise((res, rej) => {
            userCollection.find((err, data) => {
                if (!err) {
                    res(data)
                } else {
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
                }
            }).lean()
        })
    },
    doAdminLogin: (loginData) => {
        Email = loginData.Email
        return new Promise((res, rej) => {

            adminCollection.findOne({ Email: Email }, ((err, data) => {
                if (data) {
                    let response = {}
                    if (data.Password == loginData.Password) {
                        response.adminData = data
                        response.status = true
                        res(response)
                    } else {
                        rej({ passwordErr: true })
                    }
                } else {
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
                    $sort: { "orders.date": -1 }
                }
            ]).then((data) => {
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
                res(data)
            })
        })

    },
    changeOrderStatus: (orderId, userId, status) => {
        return new Promise(async (res, rej) => {
            let response = {}
            let userOrder = await orderCollection.findOne({ userId: userId })
            if (userOrder) {
                let orderIndex = userOrder.orders.findIndex(p => p._id == orderId)
                if (orderIndex >= 0) {
                    let changeStatusOrder = userOrder.orders[orderIndex]
                    changeStatusOrder.paymentStatus = status
                    userOrder.orders[orderIndex] = changeStatusOrder
                    userOrder.save()

                    res()
                } else {
                    rej()
                }
            } else {
                rej()
            }
        })
    },
    orderCanceleAdmin: (orderId, userId) => {
        return new Promise(async (res, rej) => {
            let response = {}
            let userOrder = await orderCollection.findOne({ userId: userId })
            if (userOrder) {
                let orderIndex = userOrder.orders.findIndex(p => p._id == orderId)
                if (orderIndex >= 0) {
                    let cancelOrder = userOrder.orders[orderIndex]
                    cancelOrder.paymentStatus = 'Canceld'
                    userOrder.orders[orderIndex] = cancelOrder
                    userOrder.save()
                    res()
                } else {
                    rej()
                }
            } else {
                rej()
            }
        })
    },
    addCouponToCollection: (couponDetailes) => {
        return new Promise((res, rej) => {
            couponCollection.create({
                couponName: couponDetailes.couponName,
                discount: couponDetailes.discount,
                quantity: couponDetailes.Quantity,
                date: new Date().toJSON().slice(0, 10),
                validity: couponDetailes.validity,
                couponCode: codeGen,
                maximumPurchase: couponDetailes.maximumAmount
            }).then((data) => {
                res()
            })
        })
    },
    getAllCouponse: () => {
        return new Promise((res, rej) => {
            couponCollection.find().lean().then((data) => {
                res(data)
            })
        })

    },
    removeCoupon: (couponId) => {
        return new Promise((res, rej) => {
            couponCollection.deleteOne({ _id: couponId }).then((data) => {
                res(data)
            })
        })

    },
    getDashbordDataCod: () => {
        return new Promise((res, rej) => {
            orderCollection.aggregate([

                {
                    $project: {
                        orders: 1
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders.paymentType": 'Cash On Delivery'
                    }
                },
                {
                    $group: {
                        _id: {
                            date: "$orders.date",
                            payment: "$orders.paymentType"
                        },
                        count: { $sum: 1 }

                    }
                },
                {
                    $sort: {
                        "_id.date": -1
                    }
                }
            ]).limit(7).then((data) => {
                res(data)
            })
        })

    },
    getDashbordDataOP: () => {
        return new Promise((res, rej) => {
            orderCollection.aggregate([

                {
                    $project: {
                        orders: 1
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders.paymentType": 'Online Payment'
                    }
                },
                {
                    $group: {
                        _id: {
                            date: "$orders.date",
                            payment: "$orders.paymentType"
                        },
                        count: { $sum: 1 }

                    }
                },
                {
                    $sort: {
                        "_id.date": -1
                    }
                },
            ]).limit(7).then((data) => {
                res(data)
            })
        })
    },
    getDashordOrderData: () => {
        return new Promise((res, rej) => {
            orderCollection.aggregate([

                {
                    $project: {
                        orders: 1
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $group: {
                        _id: {
                            date: "$orders.date",
                        },
                        count: { $sum: 1 }

                    }
                },
                {
                    $sort: {
                        "_id.date": -1
                    }
                },
            ]).limit(7).then((data) => {
                res(data)
            })
        })
    },
    getDashbordIncome: () => {
        return new Promise((res, rej) => {
            orderCollection.aggregate([

                {
                    $project: {
                        orders: 1
                    }
                },
                {
                    $unwind: "$orders"
                },

                {
                    $group: {
                        _id: {
                            date: "$orders.date",
                        },
                        totalPrice: {
                            $sum: "$orders.totalAmount"
                        },
                        count: { $sum: 1 }

                    }
                },
                {
                    $sort: {
                        "_id.date": -1
                    }
                },
            ]).limit(7).then((data) => {
                res(data)
            })
        })
    },
    getOrdersAndCanceldOrders: () => {
        return new Promise((res, rej) => {
            orderCollection.aggregate([

                {
                    $project: {
                        orders: 1
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders.paymentStatus": "Canceld"
                    }
                },
                {
                    $group: {
                        _id: {
                            paymentStatus: "Canceld"

                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.date": -1
                    }
                },

            ]).limit(30).then((data) => {
                let response = {}
                orderCollection.aggregate([

                    {
                        $project: {
                            orders: 1
                        }
                    },
                    {
                        $unwind: "$orders"
                    },
                ]).then((orders) => {
                    response.canceldOrders = data[0].count
                    response.successOrders = orders.length - data[0].count
                    res(response)
                })

            })
        })
    },
    getSalesReport:()=>{
        return new Promise((res, rej) => {
            orderCollection.aggregate([

                {
                    $project: {
                        orders: 1
                    }
                },
                {
                    $unwind: "$orders"
                },

                {
                    $group: {
                        _id: {
                            date: "$orders.date",
                        },
                        totalPrice: {
                            $sum: "$orders.totalAmount"
                        },
                        count: { $sum: 1 },
                    }
                },
                {
                    $sort: {
                        "_id.date": -1
                    }
                },
            ]).limit(30).then((data) => {
                res(data)
            })
        })

    },
    addBanner:(bannerData) => {
        return new Promise((res, rej) => {
            bannerCollection.create({
                Description: bannerData.Description,
                category: bannerData.category,
                image: bannerData.img
            }).then((data) => {
                res(data)
            })
        })
    },
    getBannerList: () => {
        return new Promise((res, rej) => {
            bannerCollection.find()
                .lean()
                .then((data) => {
                    res(data)
                })
        })
    }
}