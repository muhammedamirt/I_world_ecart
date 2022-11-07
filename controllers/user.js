// env files
require('dotenv').config();
// helpers & collection
const userCollection = require('../models/schema/user')
const orderCollection = require('../models/schema/order')
const userHelpers = require('../helpers/user-helpers')
const productHelpers = require("../helpers/productHelpers")
// easy invoice for users
const easyinvoice = require('easyinvoice')
const fs = require('fs')
// otp tockense
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUATH_TOKEN
const verifySid = process.env.VERIFY_SID
const client = require('twilio')(accountSid, authToken);
// some variables
let selectAdressData = null
let signupErr = {}
let otpErr = {}
// datas for invoice
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
        "tax-notation": "Offer"
    },

};



module.exports = {
    getHome: async (req, res) => {
        try {
            await userHelpers.getBannersData().then((data) => {
                bannerData = data
            })
            if (req.session.user) {
                let user = req.session.user
                let userId = user._id
                let bannerData;
                await userHelpers.getBannersData().then((data) => {
                    bannerData = data
                }).catch((data) => {
                    if (data.catchErr) {
                        res.redirect('/internal-server-error')
                    }
                })
                userHelpers.getWishlistProducts(userId).then((data) => {
                    res.render("user/index.hbs", { userHome: true, user, data, bannerData })
                }).catch((data) => {
                    if (data.catchErr) {
                        res.redirect('/internal-server-error')
                    }
                })
            } else {
                res.render("user/index.hbs", { userHome: true, bannerData })
            }
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    //autentication controllers
    getLogin: (req, res) => {
        try {
            if (req.session.user) {
                res.redirect('/')
            } else {
                res.render('user/user-login', { loginPage: true })
            }
        } catch (err) {
            res.redirect('/internal-server-error')
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
                    } else {
                        res.redirect('/internal-server-error')
                    }
                })
        } catch {
            res.redirect('/internal-server-error')
        }
    },
    getSignup: (req, res) => {
        try {
            if (req.session.user) {
                res.redirect('/')
            } else {
                if (signupErr) {
                    let errMessage = signupErr.errMessage
                    let balData = signupErr.data
                    res.render('user/user-signup', { errMessage, balData, loginPage: true })
                    signupErr = {}
                } else {
                    res.render('user/user-signup')

                }
            }
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    postSignup: (req, res) => {
        try {
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
            }).catch((data) => {
                if (data.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    getOtpConfermation: (req, res) => {
        try {
            if (req.session.user) {
                res.redirect("/")
            } else {
                if (otpErr.status) {
                    let message = otpErr.message
                    res.render("user/OTP-confermation", { message })
                    otpErr.message = {}
                } else {
                    res.render("user/OTP-confermation")
                }
            }
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    postOtp: (req, res) => {
        try {
            const otp = req.body.OTP
            let signupData = req.session.detail

            client.verify.v2.services(verifySid)
                .verificationChecks
                .create({ to: '+91' + signupData.Mobile, code: otp })
                .then(verification_check => {
                    if (verification_check.status === "approved") {
                        userHelpers.doSignup(signupData).then((response) => {
                            req.session.user = response.user
                            req.session.loggedIn = true
                            res.redirect('/')
                        }).catch((response) => {
                            if (response.catchErr) {
                                res.redirect('/internal-server-error')
                            } else {
                                signupErr.errMessage = "Email Already Exist !"
                                signupErr.status = true
                                signupErr.data = response.balData
                                res.redirect('/user-signup')
                            }
                        })

                    } else {
                        otpErr.message = "Enter valid OTP"
                        otpErr.status = true
                        res.redirect('/OTP-confermation')
                    }
                })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    //main page controllers
    getShop: (req, res) => {
        try {
            let user = req.session.user
            productHelpers.getCateguryList().then((category) => {
                productHelpers.getProductDetails().then((products) => {
                    res.render('user/user-shop', { products, user, category })
                })
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    getCart: (req, res) => {
        try {
            let userId = req.session.user._id
            req.session.couponStatus = false
            userHelpers.getCartProducts(userId).then((cartData) => {
                if (cartData) {
                    let productData = cartData.cartItems
                    res.render('user/cart-items', { productData, cartData })

                } else {
                    res.render('user/cart-items')
                }
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch {
            res.redirect('/internal-server-error')
        }
    },
    getCeckout: async (req, res) => {
        try {
            let userId = req.session.user._id
            let userData;
            let addressList;
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
                if (offData.dataStatus) {
                    let response = {}
                    response.offPercentage = offData.discount
                    userHelpers.getCartProducts(userId).then((cartData) => {
                        if (cartData) {
                            response.offAmount = Number(cartData.totalAmount) * Number(response.offPercentage) / 100;
                            let productData = cartData.cartItems
                            res.render('user/checkout', { productData, cartData, userData, response, addressList, selectAddress })
                            selectAdressData = null
                        } else {
                            res.render('user/cart-items')
                        }
                    }).catch((err) => {
                        if (err.catchErr) {
                            res.redirect('/internal-server-error')
                        }
                    })
                } else {
                    userHelpers.getCartProducts(userId).then((cartData) => {
                        if (cartData) {
                            let productData = cartData.cartItems
                            res.render('user/checkout', { productData, cartData, userData, addressList, selectAddress })
                            selectAdressData = null
                        } else {
                            res.render('user/cart-items')
                        }
                    }).catch((err) => {
                        if (err.catchErr) {
                            res.redirect('/internal-server-error')
                        }
                    })
                }
            } else {
                await userCollection.findOne({ _id: req.session.user._id })
                    .lean()
                    .then((data) => {
                        if (data) {
                            userData = data
                            addressList = data.address
                        }
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
                if (offData.dataStatus) {
                    let response = {}
                    response.offPercentage = offData.discount
                    userHelpers.getCartProducts(userId).then((cartData) => {
                        if (cartData) {
                            response.offAmount = Number(cartData.totalAmount) * Number(response.offPercentage) / 100;
                            let productData = cartData.cartItems
                            res.render('user/checkout', { productData, cartData, userData, response, addressList })
                        } else {
                            res.render('user/cart-items')
                        }
                    }).catch((err) => {
                        if (err.catchErr) {
                            res.redirect('/internal-server-error')
                        }
                    })
                } else {
                    userHelpers.getCartProducts(userId).then((cartData) => {
                        if (cartData) {
                            let productData = cartData.cartItems
                            res.render('user/checkout', { productData, cartData, userData, addressList })
                        } else {
                            res.render('user/cart-items')
                        }
                    }).catch((err) => {
                        if (err.catchErr) {
                            res.redirect('/internal-server-error')
                        }
                    })
                }
            }
        } catch {
            res.redirect('/internal-server-error')
        }
    },
    getProductDetails:async (req, res) => {
        try {
            let user = req.session.user
            let productId = req.params.id
            productHelpers.getOneProduct(productId).then((data) => {
                let product = data
                let images = data.images
                productHelpers.getRelatedProducts(req.params.category).then((data) => {
                    res.render('user/product-detailes', { product, user, images, data })
                }).catch((response) => {
                    if (response.dataNull) {
                        res.redirect('/error-page')
                    }
                })
            }).catch((response) => {
                if (response.dataNull) {
                    res.redirect('/error-page')
                }
            })
        } catch {
            res.redirect('/internal-server-error')
        }
    },
    getProfile: (req, res) => {
        try {
            let userData = req.session.user
            userCollection.findOne({ _id: userData._id })
                .lean()
                .then((data) => {
                    let user = data
                    res.render('user/user-profile', { user })
                })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getWishlist: (req, res) => {
        try {
            let user = req.session.user
            userHelpers.getWishlistProducts(user._id).then((data) => {
                res.render('user/wishlist', { user, data })
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    // profile management
    getEditProfile: (req, res) => {
        try {
            let user = req.session.user
            res.render('user/edit-profile', { user })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    postEditProfile: (req, res) => {
        try {
            let prodId = req.params.id
            userHelpers.editProfile(prodId, req.body).then((updateUser) => {
                req.session.user = updateUser
                res.redirect('/view-profile')
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    filterProduct: (req, res) => {
        try {
            let user = req.session.user
            let filterCategury = req.body.filter
            productHelpers.getCateguryList().then((category) => {
                userHelpers.findFilterCategoryProduct(filterCategury).then((products) => {
                    res.render('user/user-shop', { products, user, category })
                })
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getUserLogout: (req, res) => {
        try {
            req.session.user = null
            req.session.loggedIn = false
            res.json({ status: true })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    // cart management
    getAddToCart: (req, res) => {
        try {
            if (req.session.user) {
                let user = req.session.user
                let productId = req.params.prodId
                let userId = user._id
                userHelpers.addProductToCart(productId, userId).then((data) => {
                    res.json({ status: true })
                }).catch((err) => {
                    if (err.catchErr) {
                        res.redirect('/internal-server-error')
                    }
                })
            } else {
                res.json({ status: false })
            }
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    postAddToCart: (req, res) => {
        try {
            let userId = req.session.user._id
            let quantity = req.body.quantity
            let productId = req.params.prodId
            userHelpers.addProductToCartQuantity(productId, quantity, userId)
                .then((data) => {
                    res.redirect('/view-cart')
                }).catch((err) => {
                    if (err.catchErr) {
                        res.redirect('/internal-server-error')
                    }
                })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getRemoveCartProduct: (req, res, next) => {
        try {
            let productId = req.params.id
            let userId = req.session.user._id
            userHelpers.removeCartProduct(productId, userId).then((data) => {
                res.redirect('/view-cart')
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getIncQuantity: (req, res) => {
        try {
            let user = req.session.user
            let productId = req.params.id
            let userId = user._id
            userHelpers.incCartProductQuantity(productId, userId).then((data) => {
                res.redirect('/view-cart')
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })

        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getdcrQuantity: (req, res) => {
        try {
            let user = req.session.user
            let productId = req.params.id
            let userId = user._id
            userHelpers.decCartProductQuantity(productId, userId).then((data) => {
                res.redirect('/view-cart')
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    //order management
    postOrderDetailes: (req, res) => {
        try {
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
                        userHelpers.generateRazorpay(orderId, totalAmount).then((response) => {
                            res.json(response)
                        }).catch((err) => {
                            res.json({ limitErr: true })
                        })
                    } else {
                        res.json({ status: true })
                    }

                }).catch((data) => {
                    if (data?.catchErr) {
                        res.redirect('/internal-server-error')
                    } else {
                        res.json({ issue: true })
                    }

                })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getViewOrders: (req, res) => {
        try {
            userId = req.session.user._id
            userHelpers.getOrderProducts(userId).then((data) => {

                res.render('user/view-orders-user', { data })
            }).catch(() => {
                res.render('user/view-orders-user')
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getMoreAboutOrder: (req, res) => {
        try {
            let orderId = req.params.orderId
            userHelpers.getMoreOrderDetailes(orderId).then((data) => {
                if (data) {
                    let userData = data[0]
                    let products = data[0].orders.products
                    res.render('user/more-about-order', { userData, products })
                } else {
                    res.redirect('/internal-server-error')
                }

            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getUserOrderCancel: (req, res) => {
        try {
            let userId = req.session.user._id
            let orderId = req.params.orderId
            userHelpers.userOrderCanceling(orderId, userId).then((data) => {
                res.json({ status: true })
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    postVerifyPayment: (req, res) => {
        try {
            let userId = req.session.user._id
            userHelpers.verifyPayment(req.body).then(() => {
                userHelpers.changeOrderStatus(req.body['order[receipt]'], userId)
                    .then(() => {
                        res.json({ status: true })
                    })
                    .catch((err) => {
                        if (err?.catchErr) {
                            res.redirect('/internal-server-error')
                        } else {
                            res.json({ status: false })
                        }
                    })
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getAddProductToWishlist: (req, res) => {
        try {
            if (req.session.user) {
                let productId = req.params.prodId
                let userId = req.session.user._id
                userHelpers.addProductToWishlist(productId, userId)
                    .then((data) => {
                        res.json({ status: true })
                    }).catch((data) => {
                        if (data?.catchErr) {
                            res.redirect('/internal-server-error')
                        } else {
                            res.json({ status: false })
                        }
                    })
            } else {
                res.json('notLogged')
            }
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    getViewContact: (req, res) => {
        try {
            res.render('user/contact-us')
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    //coupon managenent
    getCouponSubmission: (req, res) => {
        try {
            let userId = req.session.user._id
            let couponCode = req.body.coupenCode
            let totalAmount = req.body.totalAmount
            userHelpers.applayCouponChecking(userId, couponCode, totalAmount).then((data) => {
                if (data.status) {
                    req.session.couponData = data.couponData
                    req.session.couponStatus = true
                    res.json(data)
                } else {
                    req.session.couponStatus = false
                }
            }).catch((err) => {
                if (err?.catchErr) {
                    res.redirect('/internal-server-error')
                } else {
                    res.json(err)
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    postEditAddress: (req, res) => {
        try {
            let user = req.session.user._id
            userHelpers.editUserAddress(user, req.body).then((data) => {
                res.redirect('/view-profile')
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getRemoveWishlist: (req, res) => {
        try {
            let userId = req.session.user._id
            let productId = req.params.productId
            userHelpers.removeWishlistProduct(userId, productId).then((data) => {
                res.json({ status: true })
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    // dowload invoice
    downloadInvoce: (req, res) => {
        try {
            let orderId = req.params.orderId
            let userId = req.session.user._id
            orderCollection.findOne({ userId: userId }).then((data) => {
                let orderIndex = data.orders.findIndex(p => p._id == orderId)
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
                easyinvoice.createInvoice(invoiceData, async function (result) {
              
                    /*  
                        5.  The 'result' variable will contain our invoice as a base64 encoded PDF
                            Now let's save our invoice to our local filesystem so we can have a look!
                            We will be using the 'fs' library we imported above for this.
                    */
                    fs.writeFileSync("./public/invoice/invoice.pdf", result.pdf, 'base64');
                    await res.download('./public/invoice/invoice.pdf')

                })
            }).catch((err) => {
                if (err?.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    // address management
    getSelectAddress: (req, res) => {
        try {
            selectAdressData = null
            let userId = req.session.user._id
            let addressId = req.params.addressId
            userHelpers.selectAddress(userId, addressId).then((data) => {
                selectAdressData = data
                res.redirect('/view-checkout')
            }).catch((err) => {
                if (err.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    getManageAddress: (req, res) => {
        try {
            let userId = req.session.user._id
            userHelpers.getAddressList(userId).then((data) => {
                res.render('user/manage-address', { data })
            }).catch((err) => {
                if (err?.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }


    },
    getAddAdress: (req, res) => {
        try {
            res.render('user/add-new-address')
        } catch (err) {
            res.redirect('/internal-server-error')
        }
    },
    getRemoveAddress: (req, res) => {
        try {
            let userId = req.session.user._id
            let addressId = req.params.addressId
            userHelpers.removeAddress(userId, addressId).then((data) => {
                res.redirect('/manage-address')
            }).catch((err) => {
                if (err?.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    },
    postAddAddress: (req, res) => {
        try {
            let userId = req.session.user._id
            userHelpers.addNewAddress(userId, req.body).then((data) => {
                res.redirect('/manage-address')
            }).catch((err) => {
                if (err?.catchErr) {
                    res.redirect('/internal-server-error')
                }
            })
        } catch (err) {
            res.redirect('/internal-server-error')
        }

    }
}