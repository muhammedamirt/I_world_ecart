require('dotenv').config();

const userCollection = require('../models/schema/user')
const orderCollection = require('../models/schema/order')
const userHelpers = require('../helpers/user-helpers')
const productHelpers = require("../helpers/productHelpers")
const easyinvoice = require('easyinvoice')
const fs = require('fs')

const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUATH_TOKEN
const verifySid = process.env.VERIFY_SID

const client = require('twilio')(accountSid, authToken);

let selectAdressData = null
let signupErr = {}
let otpErr = {}

let invoiceData = {
    "client": {
        "company": "iWorld Ecart",
        "address": "Street 456",
        "zip": "Zip code",
        "country": "Country Name"
    },

    "information": {
        // Invoice number
        "number": "2021.0001",
        // Invoice data
        date: "12-12-2021",
    },

    products: [],

    "settings": {
        "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
    },

};



module.exports = {
    getHome: async (req, res) => {

        await userHelpers.getBannersData().then((data) => {
            bannerData = data
        })
        if (req.session.user) {
            let user = req.session.user
            let userId = user._id
            let bannerData;
            await userHelpers.getBannersData().then((data) => {
                bannerData = data
            })
            userHelpers.getWishlistProducts(userId).then((data) => {
                console.log(data);
                res.render("user/index.hbs", { userHome: true, user, data, bannerData })
            })
        } else {
            res.render("user/index.hbs", { userHome: true, bannerData })
        }
    },

    //autentication

    getLogin: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        } else {
            res.render('user/user-login')
        }
    },
    postLogin: (req, res) => {
        try {

            userHelpers.doLogin(req.body)
                .then((response) => {
                    req.session.user = response.user
                    req.session.loggedIn = true
                    res.json({ loginStatus: true })
                }).catch((response) => {
                    if (response.emailErr) {
                        res.json({ emailErr: true })
                    } else if (response.passwordErr) {
                        res.json({ passwordErr: true })
                    }
                })
        } catch {
            res.redirect('*')
        }
        // console.log(req.body);

    },
    getSignup: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        } else {
            if (signupErr) {
                let errMessage = signupErr.errMessage
                let balData = signupErr.data
                res.render('user/user-signup', { errMessage, balData })
                signupErr = {}
            } else {
                res.render('user/user-signup')

            }
        }
    },
    postSignup: (req, res) => {
        console.log(req.body);
        userHelpers.emailExistCheck(req.body.Email).then((data) => {
            if (data) {
                res.json({ emailExist: true })
            } else {
                req.session.detail = req.body
                client.verify.v2.services(verifySid)
                    .verifications
                    .create({ to: '+91' + req.body.Mobile, channel: 'sms' })
                    .then(verification => console.log(verification.status));
                res.json({ status: true })
            }
        })

    },
    getOtpConfermation: (req, res) => {
        if (req.session.user) {
            res.redirect("/")
        } else {
            if (otpErr.status) {
                let message = otpErr.message
                console.log(message);
                res.render("user/OTP-confermation", { message })
                otpErr.message = {}
            } else {
                res.render("user/OTP-confermation")
            }


        }
    },
    postOtp: (req, res) => {
        const otp = req.body.OTP
        console.log(otp)
        let signupData = req.session.detail
        console.log(signupData);

        client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: '+91' + signupData.Mobile, code: otp })
            .then(verification_check => {
                // console.log(verification_check.status)
                if (verification_check.status === "approved") {
                    userHelpers.doSignup(signupData).then((response) => {
                        console.log(response);
                        req.session.user = response.user
                        req.session.loggedIn = true
                        res.redirect('/')
                        console.log('data added');
                    }).catch((response) => {
                        signupErr.errMessage = "Email Already Exist !"
                        signupErr.status = true
                        signupErr.data = response.balData
                        console.log(signupErr);
                        res.redirect('/user-signup')
                    })

                } else {
                    otpErr.message = "Enter valid OTP"
                    otpErr.status = true
                    res.redirect('/OTP-confermation')
                    console.log("otp error");
                }
            })
    },
    //shop
    getShop: (req, res) => {
        let user = req.session.user
        productHelpers.getCateguryList().then((category) => {
            // console.log(category);
            productHelpers.getProductDetails().then((products) => {
                // console.log(products);
                // console.log(images);
                res.render('user/user-shop', { products, user, category })

            })
        })
    },
    getCart: (req, res) => {
        try {
            // if (req.session.user) {
            let userId = req.session.user._id
            req.session.couponStatus = false
            userHelpers.getCartProducts(userId).then((cartData) => {
                if (cartData) {
                    console.log(cartData);
                    let productData = cartData.cartItems
                    console.log(productData, "=======================");
                    res.render('user/cart-items', { productData, cartData })

                } else {
                    console.log("===========================");
                    res.render('user/cart-items')
                    // console.log("no cart");
                }
            })
        } catch {
            res.redirect('*')
        }
    },
    getCeckout: async (req, res) => {
        try {
            let userId = req.session.user._id
            let userData;
            let addressList;
            console.log(selectAdressData);
            if (selectAdressData) {
                let selectAddress = selectAdressData
                await userCollection.findOne({ _id: req.session.user._id })
                    .lean()
                    .then((data) => {
                        userData = data
                        addressList = data.address
                    })
                let offData = {
                    dataStatus: false
                }
                if (req.session.couponStatus) {
                    offData = req.session.couponData
                    offData.dataStatus = true
                } else {
                    offData.dataStatus = false
                }
                // console.log(offData.status);
                if (offData.dataStatus) {
                    console.log(offData);
                    let response = {}
                    response.offPercentage = offData.discount
                    // console.log(offPercentage);
                    userHelpers.getCartProducts(userId).then((cartData) => {
                        if (cartData) {
                            response.offAmount = Number(cartData.totalAmount) * Number(response.offPercentage) / 100;
                            let productData = cartData.cartItems
                            res.render('user/checkout', { productData, cartData, userData, response, addressList, selectAddress })
                            selectAdressData = null
                        } else {
                            res.render('user/cart-items')
                        }
                    })
                } else {
                    console.log("no coupon");
                    userHelpers.getCartProducts(userId).then((cartData) => {
                        if (cartData) {
                            let productData = cartData.cartItems
                            res.render('user/checkout', { productData, cartData, userData, addressList, selectAddress })
                            selectAdressData = null
                        } else {
                            res.render('user/cart-items')
                        }
                    })
                }
            } else {
                await userCollection.findOne({ _id: req.session.user._id })
                    .lean()
                    .then((data) => {
                        userData = data
                        // console.log(data);
                        // if (data.address.length !== 0) {
                        addressList = data.address
                        // }
                    })
                let offData = {
                    dataStatus: false
                }
                if (req.session.couponStatus) {
                    offData = req.session.couponData
                    offData.dataStatus = true
                } else {
                    offData.dataStatus = false
                }
                // console.log(offData.status);
                if (offData.dataStatus) {
                    console.log(offData);
                    let response = {}
                    response.offPercentage = offData.discount
                    // console.log(offPercentage);
                    userHelpers.getCartProducts(userId).then((cartData) => {
                        if (cartData) {
                            response.offAmount = Number(cartData.totalAmount) * Number(response.offPercentage) / 100;
                            let productData = cartData.cartItems
                            res.render('user/checkout', { productData, cartData, userData, response, addressList })
                        } else {
                            res.render('user/cart-items')
                        }
                    })
                } else {
                    console.log("no coupon");
                    userHelpers.getCartProducts(userId).then((cartData) => {
                        if (cartData) {
                            let productData = cartData.cartItems
                            res.render('user/checkout', { productData, cartData, userData, addressList })
                        } else {
                            res.render('user/cart-items')
                        }
                    })
                }
            }
        } catch {
            res.redirect('*')
        }


    },
    getProductDetails: (req, res) => {
        try {
            let user = req.session.user
            let productId = req.params.id
            productHelpers.getOneProduct(productId).then((data) => {
                let product = data
                let images = data.images
                productHelpers.getRelatedProducts(req.params.category).then((data) => {
                    res.render('user/product-detailes', { product, user, images, data })
                })

            })
        } catch {
            res.redirect('*')
        }
    },
    getProfile: (req, res) => {
        
        // if (req.session.user) {
        let userData = req.session.user
        userCollection.findOne({ _id: userData._id })
            .lean()
            .then((data) => {
                let user = data
                res.render('user/user-profile', { user })
            })
        //    } else {
        //         res.redirect('/user-login')
        //     }
    },
    getWishlist: (req, res) => {
        let user = req.session.user
        userHelpers.getWishlistProducts(user._id).then((data) => {
            res.render('user/wishlist', { user, data })
        })


    },
    getEditProfile: (req, res) => {

        let user = req.session.user
        res.render('user/edit-profile', { user })


    },
    postEditProfile: (req, res) => {
        let prodId = req.params.id
        // console.log(req.body);
        userHelpers.editProfile(prodId, req.body).then((updateUser) => {
            console.log("=============================");
            req.session.user = updateUser
            res.redirect('/view-profile')
        })
    },
    filterProduct: (req, res) => {
        console.log(req.body);
        let user = req.session.user
        let filterCategury = req.body.filter
        productHelpers.getCateguryList().then((category) => {
            userHelpers.findFilterCategoryProduct(filterCategury).then((products) => {
                res.render('user/user-shop', { products, user, category })
            })
        })

    },
    getUserLogout: (req, res) => {
        req.session.user = null
        req.session.loggedIn = false
        res.json({ status: true })
    },
    //cart session starting
    getAddToCart: (req, res) => {
        if (req.session.user) {
            let user = req.session.user
            let productId = req.params.prodId
            let userId = user._id
            console.log(productId, userId)
            userHelpers.addProductToCart(productId, userId).then((data) => {
                // console.log('cart created');
                res.json({ status: true })
            })
        } else {
            res.json({ status: false })
        }



    },
    postAddToCart: (req, res) => {

        let userId = req.session.user._id
        let quantity = req.body.quantity
        let productId = req.params.prodId
        console.log(quantity, "+++++++++++++++++++++++++++");

        userHelpers.addProductToCartQuantity(productId, quantity, userId)
            .then((data) => {
                console.log(data);
                res.redirect('/view-cart')
            })


    },
    getRemoveCartProduct: (req, res, next) => {
        let productId = req.params.id
        let userId = req.session.user._id
        userHelpers.removeCartProduct(productId, userId).then((data) => {
            console.log(data);
            res.redirect('/view-cart')
        })

    },
    getIncQuantity: (req, res) => {
        let user = req.session.user
        let productId = req.params.id
        let userId = user._id
        userHelpers.incCartProductQuantity(productId, userId).then((data) => {
            console.log(productId);
            res.redirect('/view-cart')
        })

    },
    getdcrQuantity: (req, res) => {
        let user = req.session.user
        let productId = req.params.id
        let userId = user._id
        userHelpers.decCartProductQuantity(productId, userId).then((data) => {
            console.log(productId);
            res.redirect('/view-cart')
        })

    },
    postOrderDetailes: (req, res) => {
        console.log(req.body);
        let userAddress = req.body.address
        let userId = req.session.user._id
        let userCoupon = {
            couponData: req.session.couponData,
            couponStatus: req.session.couponStatus
        }
        userHelpers.addProductToOrders(req.body, userAddress, userId, userCoupon)
            .then((response) => {
                let orderId = response.orderId
                let totalAmount = response.totalAmount
                if (req.body.payment == "Cash On Delivery") {
                    res.json({ codStatus: true })

                } else if (req.body.payment == "Online Payment") {
                    // console.log("hello");
                    userHelpers.generateRazorpay(orderId, totalAmount).then((response) => {
                        console.log('hello');
                        res.json(response)
                    }).catch((err) => {
                        res.json({ limitErr: true })
                    })
                } else {
                    res.json({ status: true })
                }

            }).catch((data) => {
                res.json({ issue: true })
            })

    },
    // order Session starting
    getViewOrders: (req, res) => {
        userId = req.session.user._id
        userHelpers.getOrderProducts(userId).then((data) => {

            res.render('user/view-orders-user', { data })
        }).catch(() => {
            res.render('user/view-orders-user')
        })



    },
    getMoreAboutOrder: (req, res) => {
        let orderId = req.params.orderId
        userHelpers.getMoreOrderDetailes(orderId).then((data) => {
            if (data) {
                let userData = data[0]
                let products = data[0].orders.products
                // console.log(userData);
                res.render('user/more-about-order', { userData, products })
            } else {
                console.log("Unknoum error in ore about orders");
            }

        })
    },
    getUserOrderCancel: (req, res) => {
        let userId = req.session.user._id
        let orderId = req.params.orderId
        userHelpers.userOrderCanceling(orderId, userId).then((data) => {
            res.json({ status: true })
        })

    },
    postVerifyPayment: (req, res) => {
        console.log(req.body);
        let userId = req.session.user._id
        userHelpers.verifyPayment(req.body).then(() => {
            userHelpers.changeOrderStatus(req.body['order[receipt]'], userId)
                .then(() => {
                    console.log('payment success');
                    res.json({ status: true })
                })
                .catch((err) => {
                    console.log(err);
                    res.json({ status: false })

                })

        })
    },
    getAddProductToWishlist: (req, res) => {
        if (req.session.user) {
            let productId = req.params.prodId
            let userId = req.session.user._id
            userHelpers.addProductToWishlist(productId, userId)
                .then((data) => {
                    res.json({ status: true })
                }).catch((data) => {
                    res.json({ status: false })
                })
        } else {
            res.json('notLogged')
        }

    },
    getViewContact: (req, res) => {
        res.render('user/contact-us')
    },
    getCouponSubmission: (req, res) => {
        console.log(req.body);
        let userId = req.session.user._id
        let couponCode = req.body.coupenCode
        let totalAmount = req.body.totalAmount
        userHelpers.applayCouponChecking(userId, couponCode, totalAmount).then((data) => {
            console.log(data);
            if (data.status) {
                req.session.couponData = data.couponData
                req.session.couponStatus = true
                res.json(data)
            } else {
                req.session.couponStatus = false
                console.log("no data");
            }
        }).catch((err) => {
            res.json(err)
        })
    },
    postEditAddress: (req, res) => {
        let user = req.session.user._id
        userHelpers.editUserAddress(user, req.body).then((data) => {
            // console.log(data);
            res.redirect('/view-profile')
        })
    },
    getRemoveWishlist: (req, res) => {
        let userId = req.session.user._id
        let productId = req.params.productId
        userHelpers.removeWishlistProduct(userId, productId).then((data) => {
            // res.redirect('/view-wishlist')
            res.json({ status: true })
        })
    },
    downloadInvoce: (req, res) => {
        let orderId = req.params.orderId
        let userId = req.session.user._id
        orderCollection.findOne({ userId: userId }).then((data) => {
            // console.log(data);
            let orderIndex = data.orders.findIndex(p => p._id == orderId)
            console.log(orderIndex);
            let userOrder = data.orders[orderIndex]
            let productsData = userOrder.products
            invoiceData.products = []
            for (i of productsData) {
                invoiceData.products.push({
                    "quantity": Number(i.ProductQuantity),
                    "description": i.productName,
                    "price": Number(i.TotalPrice)
                })
            }
            // console.log(invoiceData);
            easyinvoice.createInvoice(invoiceData, async function (result) {
                /*  
                    5.  The 'result' variable will contain our invoice as a base64 encoded PDF
                        Now let's save our invoice to our local filesystem so we can have a look!
                        We will be using the 'fs' library we imported above for this.
                */
                fs.writeFileSync("./public/invoice/invoice.pdf", result.pdf, 'base64');
                await res.download('./public/invoice/invoice.pdf')

            })
        })
        // fs.unlinkSync('./public/invoice/invoice.pdf')
    },
    getSelectAddress: (req, res) => {
        selectAdressData = null
        let userId = req.session.user._id
        let addressId = req.params.addressId
        userHelpers.selectAddress(userId, addressId).then((data) => {
            console.log(data);
            selectAdressData = data
            res.redirect('/view-checkout')
        })
    },
    getManageAddress: (req, res) => {
        let userId = req.session.user._id
        userHelpers.getAddressList(userId).then((data) => {
            console.log(data);
            res.render('user/manage-address', { data })
        })

    },
    getAddAdress: (req, res) => {

        res.render('user/add-new-address')

    },
    getRemoveAddress: (req, res) => {
        let userId = req.session.user._id
        let addressId = req.params.addressId
        userHelpers.removeAddress(userId, addressId).then((data) => {
            res.redirect('/manage-address')
        })
    },
    postAddAddress: (req, res) => {
        console.log(req.body);
        let userId = req.session.user._id

        userHelpers.addNewAddress(userId, req.body).then((data) => {
            res.redirect('/manage-address')
        })
    }
}