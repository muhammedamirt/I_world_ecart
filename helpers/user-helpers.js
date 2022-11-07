// env files
require('dotenv').config();

const userCollection = require('../models/schema/user')
const bcrypt = require('bcrypt')
const saltRounds = 10
const cartCollection = require('../models/schema/cart')
const productCollection = require('../models/schema/products')
const orderCollection = require('../models/schema/order')
const wishlistCollection = require('../models/schema/wishlist')
const couponCollection = require('../models/schema/coupon')
const bannerCollection = require('../models/schema/banners')
const { Promise } = require('mongoose')
const mongoose = require('mongoose')


const Razorpay = require('razorpay');

let instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (res, rej) => {
            try {
                userCollection.findOne({ Email: userData.Email }).then(async (data) => {
                    if (!data) {
                        userData.Password = await bcrypt.hash(userData.Password, saltRounds)
                        let response = {}
                        const user = new userCollection
                            ({
                                FirstName: userData.FirstName,
                                LastName: userData.LastName,
                                UserName: userData.UserName,
                                Mobile: userData.Mobile,
                                Email: userData.Email,
                                Password: userData.Password,
                                Access: true

                            })

                        user.save().then((data) => {
                            response.user = data
                            response.status = true
                            res(response)
                        })
                    } else {
                        let response = {}
                        response.balData = userData
                        response.emailExist = true
                        rej(response)
                    }
                })
            } catch (err) {
                rej({ catchErr: true })
            }
        })

    },
    emailExistCheck: (userEmail) => {
        return new Promise((res, rej) => {
            try {
                userCollection.findOne({ Email: userEmail }).then((data) => {
                    res(data)
                })
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    doLogin: (userData) => {
        return new Promise(async (res, rej) => {
            try {
                let userDocument = await userCollection.findOne(({ Email: userData.Email }))
                let response = {}
                if (userDocument) {
                    bcrypt.compare(userData.Password, userDocument.Password).then((data) => {
                        response.user = userDocument
                        response.status = true
                        if (data) {
                            res(response)
                        } else {
                            response.Email = userDocument.Email
                            response.passwordErr = true
                            rej(response)
                        }
                    })
                } else {
                    response.Password = userData.Password
                    response.emailErr = true
                    rej(response)
                }
            } catch (err) {
                rej({ catchErr: true })
            }

        })
    },
    editProfile: (userId, userData) => {
        return new Promise((res, rej) => {
            try {
                userCollection.updateOne({ _id: userId }, {
                    $set: {
                        FirstName: userData.FirstName,
                        LastName: userData.LastName,
                        UserName: userData.UserName,
                        Email: userData.Email,
                        Mobile: userData.Mobile
                    }
                }).then(async (data) => {
                    let updateUser = await userCollection.findOne({ _id: userId })
                    res(updateUser)
                })
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    addProductToCart: (productId, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let cart = await cartCollection.findOne({ userId: userId })
                let items = await productCollection.findOne({ _id: productId })
                const { ProductName: productName, Price: productPrice, images: productImages } = items
                const TotalPrice = productPrice
                if (cart) {
                    let itemIndex = cart.cartItems.findIndex(p => p.productId == productId);
                    if (itemIndex >= 0) {
                        let productItem = cart.cartItems[itemIndex]
                        productItem.ProductQuantity = Number(productItem.ProductQuantity) + 1;
                        productItem.TotalPrice = Number(productItem.ProductQuantity) * Number(productItem.productPrice)
                        cart.cartItems[itemIndex] = productItem
                        cart.totalAmount = Number(cart.totalAmount) + Number(productPrice)
                    } else {
                        cart.cartItems.push({ productId, productName, ProductQuantity: 1, productPrice, TotalPrice, productImages })
                        cart.totalAmount = Number(cart.totalAmount) + Number(productPrice)
                    }
                    cart.save();
                    res()
                } else {
                    cartCollection.create({
                        userId: userId,
                        cartItems: [{ productId, productName, ProductQuantity: 1, productPrice, TotalPrice, productImages }],
                        totalAmount: productPrice,
                    })
                    res()
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })

    },
    getCartProducts: (userId) => {
        return new Promise((res, rej) => {
            try {
                cartCollection.findOne({ userId: userId })
                    .lean()
                    .then((data) => {
                        if (data) {
                            res(data)
                        } else {
                            res()
                        }
                    })
            } catch (err) {
                rej({ catchErr: true })
            }

        })

    },
    removeCartProduct: (productId, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let cart = await cartCollection.findOne({ userId })
                let itemIndex = cart.cartItems.findIndex(p => p.productId == productId);
                if (itemIndex >= 0) {
                    let productItem = cart.cartItems[itemIndex]
                    cart.totalAmount = Number(cart.totalAmount) - Number(productItem.productPrice) * Number(productItem.ProductQuantity)
                    cart.cartItems.splice(itemIndex, 1)
                    cart.save()

                    res()
                } else {
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    incCartProductQuantity: (productId, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let cart = await cartCollection.findOne({ userId: userId })
                let productData = await productCollection.findOne({ _id: productId })
                let price = productData.Price
                if (cart) {
                    let itemIndex = cart.cartItems.findIndex(p => p.productId == productId);
                    if (itemIndex >= 0) {
                        let productItem = cart.cartItems[itemIndex]
                        productItem.ProductQuantity = Number(productItem.ProductQuantity) + 1;
                        productItem.TotalPrice = Number(productItem.ProductQuantity) * Number(productItem.productPrice)
                        cart.cartItems[itemIndex] = productItem

                        cart.totalAmount = Number(cart.totalAmount) + Number(price)

                    } else {
                        cart.totalAmount = Number(cart.totalAmount) + Number(price)
                    }

                    cart.save();


                    res()

                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    decCartProductQuantity: (productId, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let cart = await cartCollection.findOne({ userId: userId })
                let productData = await productCollection.findOne({ _id: productId })
                let price = productData.Price
                if (cart) {
                    let itemIndex = cart.cartItems.findIndex(p => p.productId == productId);
                    if (itemIndex != -1) {
                        let productItem = cart.cartItems[itemIndex]
                        productItem.ProductQuantity = Number(productItem.ProductQuantity) - 1;
                        productItem.TotalPrice = Number(productItem.ProductQuantity) * Number(productItem.productPrice)
                        cart.cartItems[itemIndex] = productItem
                        cart.totalAmount = Number(cart.totalAmount) - Number(price)
                    } else {
                        cart.totalAmount = Number(cart.totalAmount) - Number(price)
                    }
                    cart.save();
                    res()
                } else {
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    addProductToCartQuantity: (productId, quantity, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let cart = await cartCollection.findOne({ userId: userId })
                let items = await productCollection.findOne({ _id: productId })
                const productName = items.ProductName
                const productPrice = items.Price
                let TotalPrice = productPrice
                const productImages = items.images
                if (cart) {
                    let itemIndex = cart.cartItems.findIndex(p => p.productId == productId);
                    if (itemIndex >= 0) {
                        let productItem = cart.cartItems[itemIndex]
                        productItem.ProductQuantity = Number(productItem.ProductQuantity) + Number(quantity);
                        productItem.TotalPrice = Number(productItem.ProductQuantity) * Number(productItem.productPrice)
                        cart.cartItems[itemIndex] = productItem
                        cart.totalAmount = Number(cart.totalAmount) + Number(productItem.productPrice) * Number(quantity)
                    } else {
                        TotalPrice = Number(items.Price) * Number(quantity)
                        cart.cartItems.push({ productId, productName, ProductQuantity: Number(quantity), productPrice, TotalPrice, productImages })
                        cart.totalAmount = Number(cart.totalAmount) + Number(TotalPrice)
                    }
                    cart.save();
                    res()
                } else {
                    cartCollection.create({
                        userId: userId,
                        cartItems: [{ productId, productName, ProductQuantity: Number(quantity), productPrice, TotalPrice: Number(productPrice) * Number(quantity), productImages }],
                        totalAmount: Number(productPrice) * Number(quantity),

                    })
                    res()
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    addProductsToCheckout: (userId) => {
        return new Promise(async (res, rej) => {
            try {
                let cart = await cartCollection.find({ userId }).lean()
                if (cart) {
                    res(cart)
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    addProductToOrders: (orderDocument, userAddress, userId, userCoupon) => {
        return new Promise(async (res, rej) => {
            try {
                let response = {
                    orderId: null,
                    totalAmount: null
                }
                let user = await userCollection.findOne({ _id: userId })
                let cart = await cartCollection.findOne({ userId: userId })
                if (cart) {
                    let order = await orderCollection.findOne({ userId: userId })
                    let paymentType = orderDocument.payment
                    let status = "pending"
                    let date = new Date().toJSON().slice(0, 10);
                    let couponOff = 0
                    let products = cart.cartItems
                    let totalAmount = cart.totalAmount
                    if (userCoupon.couponStatus) {
                        let percentage = userCoupon.couponData.discount
                        totalAmount =Number(cart.totalAmount)-Number(cart.totalAmount) * Number(percentage) / 100
                        couponOff = percentage
                        user.coupon.push({
                            couponId: userCoupon.couponData._id
                        })
                        user.save()
                    } else {
                        totalAmount = cart.totalAmount
                    }
                    let userFullName = orderDocument.firstName + " " + orderDocument.lastName
                    let userMobile = orderDocument.Mobile

                    if (order) {
                        let addressIndex = user.address.findIndex(p => p._id == orderDocument.addressId)
                        if (addressIndex == -1) {
                            user.address.push({
                                firstName: orderDocument.firstName,
                                lastName: orderDocument.lastName,
                                address: orderDocument.address,
                                Email: orderDocument.Email,
                                Mobile: userMobile
                            })
                            user.save()
                        }
                        order.orders.push({
                            date: date,
                            userName: userFullName,
                            userId: userId,
                            address: userAddress,
                            userMobile: userMobile,
                            products: products,
                            totalAmount: totalAmount,
                            paymentStatus: status,
                            paymentType: paymentType,
                            offerData: couponOff
                        })
                        order.save(async (err, data) => {
                            let orderLength = data.orders.length
                            let orderId = data.orders[orderLength - 1]._id
                            response.orderId = orderId
                            response.totalAmount = totalAmount
                            cartCollection.deleteOne({ userId: userId }).then((data)=>{
                            })
                            res(response)
                        })
                    } else {
                        user.address.push({
                            firstName: orderDocument.firstName,
                            lastName: orderDocument.lastName,
                            address: orderDocument.address,
                            Email: orderDocument.Email,
                            Mobile: userMobile
                        })
                        user.save()
                        orderCollection.create({
                            userId: userId,
                            orders: [{
                                date: date,
                                userName: userFullName,
                                userId: userId,
                                address: userAddress,
                                userMobile: userMobile,
                                products: products,
                                totalAmount: totalAmount,
                                paymentStatus: status,
                                paymentType: paymentType,
                                offerData: couponOff
                            }]
                        }).then((data) => {
                            response.orderId = data.orders[0]._id
                            response.totalAmount = totalAmount
                            cartCollection.deleteOne({ userId: userId }).then((data)=>{
                            })
                            res(response)
                        })
                    }
                } else {
                    rej()
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    getOrderProducts: (userId) => {
        return new Promise(async (res, rej) => {
            try {
                orderCollection.aggregate([
                    {
                        $match: { userId: userId }
                    },
                ]).then((data) => {
                    if (data.length !== 0) {
                        let userData = data[0]
                        let orders = userData.orders
                        let latestOrders = orders.reverse()
                        res(latestOrders)
                    } else {
                        rej()
                    }
                })
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    findFilterCategoryProduct: (category) => {
        return new Promise((res, rej) => {
            try {
                productCollection.find({ Categury: category })
                    .lean()
                    .then((data) => {
                        res(data)
                    })
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    getMoreOrderDetailes: (orderId) => {
        return new Promise(async (res, rej) => {
            try {
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
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    userOrderCanceling: (orderId, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let response = {}
                let userOrder = await orderCollection.findOne({ userId: userId })
                if (userOrder) {
                    let orderIndex = userOrder.orders.findIndex(p => p._id == orderId)
                    if (orderIndex >= 0) {
                        let cancelOrder = userOrder.orders[orderIndex]
                        cancelOrder.paymentStatus = "Canceld"
                        userOrder.orders[orderIndex] = cancelOrder
                        userOrder.save()
                        res(response)
                    } else {
                        rej()
                    }
                } else {
                    rej()
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })

    },
    generateRazorpay: (orderId, totalPrice) => {
        return new Promise((res, rej) => {
            try {
                let id = orderId.toString()
                let options = {
                    amount: totalPrice * 100,
                    currency: "INR",
                    receipt: id
                }
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        rej()
                    } else {
                        res(order)
                    }
                })
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    verifyPayment: (details) => {
        return new Promise((res, rej) => {
            try {
                const crypto = require('crypto')
                let hmac = crypto.createHmac('sha256', 'nq72hxHx3dkRXzWb61rU6cWN')

                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')

                if (hmac === details['payment[razorpay_signature]']) {
                    res()
                } else {
                    rej()
                }

            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    changeOrderStatus: (orderId, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let userOrder = await orderCollection.findOne({ userId: userId })
                if (userOrder) {
                    let orderIndex = userOrder.orders.findIndex(p => p._id == orderId)
                    if (orderIndex >= 0) {
                        let changeStatus = userOrder.orders[orderIndex]
                        changeStatus.paymentStatus = "Placed"
                        userOrder.orders[orderIndex] = changeStatus
                        userOrder.save()
                        res()
                    } else {
                        rej()
                    }
                } else {
                    rej()
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    addProductToWishlist: (productId, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let wishlist = await wishlistCollection.findOne({ userId: userId })
                let Existproduct = await wishlistCollection.findOne({ "productId.item": mongoose.Types.ObjectId(productId) })
                if (Existproduct) {
                    rej()
                } else {
                    if (wishlist) {
                        wishlist.productId.push({ item: mongoose.Types.ObjectId(productId) })
                        wishlist.save().then((data) => {
                            res(data)
                        })

                    } else {
                        wishlistCollection.create({
                            userId: userId,
                            productId: [{ item: mongoose.Types.ObjectId(productId) }]
                        }).then((data) => {
                            res(data)
                        })
                    }
                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    getWishlistProducts: (userId) => {
        return new Promise((res, rej) => {
            try {
                wishlistCollection.aggregate([
                    {
                        $match: { userId: userId }
                    },
                    {
                        $project: {
                            productId: 1
                        }
                    },
                    {
                        $unwind: {
                            path: "$productId"
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            item: "$productId.item"
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "item",
                            foreignField: "_id",
                            as: "products"

                        }
                    },
                    {
                        $project: {
                            item: 1,
                            products: { $arrayElemAt: ["$products", 0] }
                        }
                    },
                ]).then((data) => {
                    res(data)                  
                }).catch((err)=>{
                    rej({ catchErr: true }) 
                })
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    applayCouponChecking: (userId, couponCode, totalAmount) => {
        return new Promise((res, rej) => {
            try {
                let response = {}
                couponCollection.findOne({ couponCode: couponCode }).then((coupon) => {
                    if (coupon) {
                        userCollection.findOne({ _id: userId }).then((user) => {
                            if (user) {
                                let couponExist = user.coupon.findIndex(p => p.couponId == coupon._id)
                                if (couponExist == -1) {
                                    let currentDate = new Date().toJSON().slice(0, 10)
                                    if (currentDate <= coupon.validity) {
                                        if (Number(totalAmount) >= Number(coupon.maximumPurchase)) {
                                            response.couponData = coupon
                                            response.status = true
                                            res(response)
                                        } else {
                                            rej({ NeedMaximumPurchase: true })
                                        }
                                    } else {
                                        rej({ validityExpired: true })
                                    }
                                } else {
                                    rej({ alreadyUsed: true })
                                }
                            } else {
                                rej({ noUser: true })
                            }
                        })
                    } else {
                        rej({ noCoupon: true })
                    }
                })
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    editUserAddress: (userId, updateData) => {
        return new Promise((res, rej) => {
            try {
                userCollection.updateOne(
                    { _id: userId },
                    {
                        $set: {
                            address: updateData
                        }
                    }
                ).then((data) => {
                    res(data)
                })
            } catch (err) {
                rej({ catchErr: true })
            }
        })

    },
    getBannersData: () => {
        return new Promise((res, rej) => {
            try {
                bannerCollection.find().lean().then((data) => {
                    res(data)
                })
            } catch (err) {
                rej({ catchErr: true })
            }

        })

    },
    removeWishlistProduct: (userId, prodId) => {
        return new Promise(async (res, rej) => {
            try {
                let wishlist = await wishlistCollection.findOne({ userId: userId })
                let itemIndex = wishlist.productId.findIndex(p => p.item == prodId);
                if (itemIndex >= 0) {
                    wishlist.productId.splice(itemIndex, 1)
                    wishlist.save()
                    res()
                } else {

                }
            } catch (err) {
                rej({ catchErr: true })
            }
        })

    },
    selectAddress: (userId, addressId) => {
        try {
            return new Promise(async (res, rej) => {
                let user = await userCollection.findById(userId).lean()
                let addressIndex = user.address.findIndex(p => p._id == addressId)
                if (addressIndex !== -1) {
                    let addressData = user.address[addressIndex]
                    res(addressData)
                }
            })
        } catch (err) {
            rej({ catchErr: true })
        }


    },
    getAddressList: (userId) => {
        return new Promise((res, rej) => {
            try {
                userCollection.findOne({ _id: userId })
                    .lean()
                    .then((data) => {
                        if (data) {
                            let address = data.address
                            res(address)
                        }
                    })
            } catch (err) {
                rej({ catchErr: true })
            }
        })

    },
    removeAddress: (userId, addressId) => {
        return new Promise(async (res, rej) => {
            try {
                let user = await userCollection.findById(userId)
                let addressIndex = user.address.findIndex(p => p._id == addressId)
                user.address.splice(addressIndex, 1)
                user.save()
                res()
            } catch (err) {
                rej({ catchErr: true })
            }
        })
    },
    addNewAddress: (userId, addressData) => {
        return new Promise(async (res, rej) => {
            try {
                let user = await userCollection.findById(userId)
                user.address.push({
                    firstName: addressData.firstName,
                    lastName: addressData.lastName,
                    address: addressData.address,
                    Email: addressData.Email,
                    Mobile: addressData.Mobile
                })
                user.save()
                res()
            } catch (err) {
                rej({ catchErr: true })
            }
        })

    }
}