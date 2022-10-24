const userCollection = require('../models/schema/user')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const saltRounds = 10
const cartCollection = require('../models/schema/cart')
const productCollection = require('../models/schema/products')
const orderCollection = require('../models/schema/order')
const adminCollection = require('../models/schema/admin')
const wishlistCollection = require('../models/schema/wishlist')
const { Promise } = require('mongoose')
const order = require('../models/schema/order')
const { TodayInstance } = require('twilio/lib/rest/api/v2010/account/usage/record/today')
const mongoose = require('mongoose')

// const orderCollection = require('../models/schema/order')/

const Razorpay = require('razorpay');

let instance = new Razorpay({
    key_id: 'rzp_test_XRAcAd05q4QasW',
    key_secret: 'nq72hxHx3dkRXzWb61rU6cWN',
});

const regExp = /^[a-zA-Z]*$/

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (res, rej) => {
            userCollection.findOne({ Email: userData.Email }).then(async (data) => {
                // if(userData.OTP == ){
                console.log(userData);
                // }else{

                // }
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
                        // console.log(data);
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


        })

    },
    doLogin: (userData) => {
        return new Promise(async (res, rej) => {
            let userDocument = await userCollection.findOne(({ Email: userData.Email }))
            // console.log(userDocument);
            let response = {}
            if (userDocument) {
                bcrypt.compare(userData.Password, userDocument.Password).then((data) => {
                    // console.log("data is======="+data);
                    response.user = userDocument
                    response.status = true
                    if (data) {
                        console.log('login seccess');
                        res(response)
                    } else {
                        console.log('password wrong');
                        response.Email = userDocument.Email
                        response.passwordErr = true
                        rej(response)
                    }
                })
            } else {
                console.log('email Error');
                response.Password = userData.Password
                response.emailErr = true
                rej(response)
            }
        })
    },
    editProfile: (userId, userData) => {
        return new Promise((res, rej) => {
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
        })
    },
    addProductToCart: (productId, userId) => {
        return new Promise(async (res, rej) => {
            try {
                let cart = await cartCollection.findOne({ userId: userId })
                let items = await productCollection.findOne({ _id: productId })
                const productName = items.ProductName
                const productPrice = items.Price
                const TotalPrice = productPrice
                const productImages = items.images
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
                    console.log('Enter to else');
                    cartCollection.create({
                        userId: userId,
                        cartItems: [{ productId, productName, ProductQuantity: 1, productPrice, TotalPrice, productImages }],
                        totalAmount: productPrice,
                    })
                    res()
                }


            } catch (err) {
                console.log(err);
            }
        })

    },
    getCartProducts: (userId) => {
        return new Promise((res, rej) => {
            cartCollection.findOne({ userId: userId })
                .lean()
                .then((data) => {
                    if (data) {
                        res(data)
                    } else {
                        console.log("no cart");
                        res()
                    }
                })
        })

    },
    removeCartProduct: (productId, userId) => {
        // console.log(productId);
        // console.log(userId);
        return new Promise(async (res, rej) => {
            let cart = await cartCollection.findOne({ userId: userId })
            let items = await productCollection.findOne({_id:productId})
            // console.log(cart);

            let itemIndex = cart.cartItems.findIndex(p => p.productId == productId);
            console.log(itemIndex);
            if (itemIndex >= 0) {
                // console.log("============here==========");
                let productItem = cart.cartItems[itemIndex]
                cart.totalAmount = Number(cart.totalAmount) - Number(productItem.productPrice) * Number(productItem.ProductQuantity)
                cart.cartItems.splice(itemIndex, 1)
                cart.save()
               
                res()
            } else {
                console.log("Error");
            }

        })
    },
    incCartProductQuantity: (productId, userId) => {
        return new Promise(async (res, rej) => {

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
                    console.log("No Product");
                    cart.totalAmount = Number(cart.totalAmount) + Number(price)
                }

                cart.save();
                

                res()

            } else {
                console.log("No Product");
            }


            // userCartData.update({})

        })
    },
    decCartProductQuantity: (productId, userId) => {
        return new Promise(async (res, rej) => {

            let cart = await cartCollection.findOne({ userId: userId })
            let productData = await productCollection.findOne({ _id: productId })
            console.log("new cart", cart);
            console.log("product data", productData);
            let price = productData.Price
            if (cart) {
                let itemIndex = cart.cartItems.findIndex(p => p.productId == productId);
                console.log(itemIndex);
                if (itemIndex != -1) {
                    let productItem = cart.cartItems[itemIndex]
                    productItem.ProductQuantity = Number(productItem.ProductQuantity) - 1;
                    productItem.TotalPrice = Number(productItem.ProductQuantity) * Number(productItem.productPrice)
                    cart.cartItems[itemIndex] = productItem

                    cart.totalAmount = Number(cart.totalAmount) - Number(price)
                } else {
                    console.log("No Product");
                    cart.totalAmount = Number(cart.totalAmount) - Number(price)

                }
                cart.save();
               
                res()

            } else {
                console.log("No Product");
            }


            // userCartData.update({})

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
                    console.log("++=================++");
                    let itemIndex = cart.cartItems.findIndex(p => p.productId == productId);
                    if (itemIndex >= 0) {
                        let productItem = cart.cartItems[itemIndex]
                        console.log(quantity);
                        productItem.ProductQuantity = Number(productItem.ProductQuantity) + Number(quantity);
                        productItem.TotalPrice = Number(productItem.ProductQuantity) * Number(productItem.productPrice)
                        cart.cartItems[itemIndex] = productItem
                        cart.totalAmount = Number(cart.totalAmount) + Number(productItem.productPrice) * Number(quantity)
                    } else {
                        console.log("here");
                        TotalPrice = Number(items.Price) * Number(quantity)
                        cart.cartItems.push({ productId, productName, ProductQuantity: Number(quantity), productPrice, TotalPrice, productImages })
                        cart.totalAmount = Number(cart.totalAmount) + Number(TotalPrice)
                    }

                    cart.save();

                   
                    
                    res()
                } else {
                    console.log('Enter to else');

                    cartCollection.create({
                        userId: userId,
                        cartItems: [{ productId, productName, ProductQuantity: Number(quantity), productPrice, TotalPrice: Number(productPrice) * Number(quantity), productImages }],
                        totalAmount: Number(productPrice) * Number(quantity),

                    })
                    res()
                }


            } catch (err) {
                console.log(err);
            }
        })
    },
    addProductsToCheckout: (userId) => {
        return new Promise(async (res, rej) => {
            let cart = await cartCollection.find({ userId: userId }).lean()
            console.log(cart.cartItems, "==========================");
            console.log(cart);
            res(cart)
        })

    },
    addProductToOrders: (orderDocument, userAddress, userId) => {
        return new Promise(async (res, rej) => {

            let response = {
                orderId: null,
                totalAmount: null
            }
            let user = await userCollection.findOne({ _id: userId })
            let cart = await cartCollection.findOne({ userId: userId })
            let order = await orderCollection.findOne({ userId: userId })
            let paymentType = orderDocument.payment
            let status = orderDocument.payment === "pending"
            let today = new Date()
            let date = new Date().toJSON().slice(0, 10);
            // let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            let products = cart.cartItems
            console.log(products);
            let totalAmount = cart.totalAmount
            let userFullName = user.FirstName + user.LastName
            let userMobile = user.Mobile
            if (cart) {
                if (order) {

                    console.log("already have order");

                    userCollection.updateOne(
                        { _id: userId },
                        {
                            $set: {
                                address: userAddress
                            }
                        }
                    ).then((data) => {
                        console.log(data, "++++++++++++++++++++++++")
                    })
                    order.orders.push({
                        date: date,
                        userName: userFullName,
                        userId: userId,
                        address: userAddress,
                        userMobile: userMobile,
                        products: products,
                        totalAmount: totalAmount,
                        paymentStatus: status,
                        paymentType: paymentType
                    })
                    order.save(async (err, data) => {
                        let orderLength = data.orders.length
                        console.log(orderLength);
                        let orderId = data.orders[orderLength - 1]._id
                        console.log(orderId);
                        response.orderId = orderId
                        response.totalAmount = totalAmount
                        // console.log(response);
                        console.log("product push");
                        cartCollection.deleteOne({ userId: userId }).then((data) => {
                            console.log('cart cleared ==================', data);
                        })
                        res(response)
                    })
                } else {
                    userCollection.updateOne(
                        { _id: userId },
                        {
                            $set: {
                                address: userAddress
                            }
                        }
                    ).then((data) => {
                        console.log(data, "++++++++++++++++++++++++")
                    })
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
                            paymentType: paymentType
                        }]

                    }).then((data) => {
                        response.orderId = data.orders[0]._id
                        response.totalAmount = totalAmount
                        cartCollection.deleteOne({ userId: userId }).then((data) => {
                            console.log('cart cleared ==================', data);
                        })
                        res(response)
                    })
                }
            } else {
                console.log("no cart");
                rej()
            }
        })
    },
    getOrderProducts: (userId) => {
        console.log(userId);
        return new Promise(async (res, rej) => {
            orderCollection.aggregate([
                {
                    $match: { userId: userId }
                },
            ]).then((data) => {
                let userData = data[0]
                let orders = userData.orders
                // console.log(orders);
                let latestOrders = orders.reverse()
                res(latestOrders)
            })
        })
    },
    findFilterCategoryProduct: (category) => {
        return new Promise((res, rej) => {
            productCollection.find({ Categury: category })
                .lean()
                .then((data) => {
                    // console.log(data);
                    res(data)
                })
        })
    },
    getMoreOrderDetailes: (orderId) => {
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
    },
    userOrderCanceling: (orderId, userId) => {
        return new Promise(async (res, rej) => {
            let response = {}
            let userOrder = await orderCollection.findOne({ userId: userId })
            if (userOrder) {
                let orderIndex = userOrder.orders.findIndex(p => p._id == orderId)
                if (orderIndex >= 0) {
                    let cancelOrder = userOrder.orders[orderIndex]
                    cancelOrder.paymentStatus = "canceld"
                    userOrder.orders[orderIndex] = cancelOrder
                    userOrder.save()

                    console.log("canceld");
                    res(response)
                } else {
                    rej()
                }
            } else {
                console.log("No orders");
                rej()
            }
        })

    },
    generateRazorpay: (orderId, totalPrice) => {
        return new Promise((res, rej) => {
            let id = orderId.toString()

            console.log(id, totalPrice);

            let options = {
                amount: totalPrice * 100,
                currency: "INR",
                receipt: id
            }
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("===========", order);
                    res(order)
                }

            })
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
                console.log(err);
            }
        })
    },
    changeOrderStatus: (orderId, userId) => {
        console.log(orderId, userId);
        return new Promise(async (res, rej) => {
            // let response = {}
            let userOrder = await orderCollection.findOne({ userId: userId })
            if (userOrder) {
                let orderIndex = userOrder.orders.findIndex(p => p._id == orderId)
                if (orderIndex >= 0) {
                    let changeStatus = userOrder.orders[orderIndex]
                    changeStatus.paymentStatus = "Placed"
                    userOrder.orders[orderIndex] = changeStatus
                    userOrder.save()

                    console.log("Placed");
                    res()
                } else {
                    rej()
                }
            } else {
                console.log("No orders");
                rej()
            }
        })
    },
    addProductToWishlist: (productId, userId) => {
        return new Promise(async (res, rej) => {
            let wishlist = await wishlistCollection.findOne({ userId: userId })
            let Existproduct = await wishlistCollection.findOne({"productId.item":mongoose.Types.ObjectId(productId)})
            if(Existproduct) {
                console.log("Exist");
                rej()
            }else{
                if (wishlist) {
                    console.log("already have wishlist");
                    wishlist.productId.push({ item: mongoose.Types.ObjectId(productId) })
                    wishlist.save().then((data) => {
                        // console.log(data);
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
            
        })

    },
    getWishlistProducts: (userId) => {
        return new Promise((res, rej) => {
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
                // console.log(data);
                res(data)
            })
        })
    }
}