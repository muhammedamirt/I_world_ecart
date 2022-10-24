const { getLogin } = require("./admin")
const userCollection = require('../models/schema/user')
const userHelpers = require('../helpers/user-helpers')
const productHelpers = require("../helpers/productHelpers")
// const { response } = require("../app")

const { body, validationResult } = require('express-validator');

const regExp = /^[a-zA-Z]*$/


const accountSid = 'ACe15e0d599b28cfb6c559151c2ad3091c';
const authToken = '0b6461ce53d1e5185b9ed6cfff1303d5';
const client = require('twilio')(accountSid, authToken);
const otpGenerator = require('otp-generator');
const categury = require("../models/schema/categury");

const otpgen = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false });

let emailErrVal = {}
let passwordErrVal = {}
let signupErr = {}
let otpErr = {}




module.exports = {
    getHome: (req, res) => {
        if (req.session.user) {
            let user = req.session.user
            let userId = user._id
            userHelpers.getWishlistProducts(userId).then((data) => {
                console.log(data);
                res.render("user/index.hbs", { userHome: true, user, data })
            })
        } else {
            res.render("user/index.hbs", { userHome: true })
        }


    },

    //autentication

    getLogin: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        } else {
            if (emailErrVal.status) {
                let errPass = emailErrVal.errPass
                let emailMessage = emailErrVal.message
                res.render('user/user-login', { emailMessage, errPass })
                emailErrVal = {}
            } else if (passwordErrVal.status) {
                // console.log("iam here");
                let errEmail = passwordErrVal.Email
                let passwordMessage = passwordErrVal.message
                res.render('user/user-login', { passwordMessage, errEmail })
                passwordErrVal = {}
            } else {
                res.render('user/user-login')
            }
        }

    },
    postLogin: (req, res) => {
        // console.log(req.body);

        userHelpers.doLogin(req.body).then((response) => {
            req.session.user = response.user
            req.session.loggedIn = true
            res.redirect('/')
        }).catch((response) => {
            // console.log("email error = "+response.emailErr);

            if (response.emailErr) {
                emailErrVal.errPass = response.Password
                emailErrVal.message = "This Email Don't have any Account"
                emailErrVal.status = true
                res.redirect('/user-login')
            } else if (response.passwordErr) {
                passwordErrVal.Email = response.Email
                passwordErrVal.message = "Wrong Password"
                passwordErrVal.status = true
                res.redirect('/user-login')
            }
        })
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
        req.session.detail = req.body
        client.messages
            .create({
                body: otpgen,
                messagingServiceSid: 'MG4d57879faa1db44149334fac1e67bf71',
                to: '+919746784892'
            })
            .then(message => console.log(message.sid))
            .done();
        res.redirect("/OTP-confermation")
    },
    getOtpConfermation: (req, res) => {
        if (req.session.user) {
            res.redirect("/")
        } else {
            if (otpErr.status) {
                let message = otpErr.message
                console.log(message);
                res.render("user/OTP-confermation", { message })
            } else {
                res.render("user/OTP-confermation")
            }


        }
    },
    postOtp: (req, res) => {
        const otp = req.body.OTP
        console.log(otp.OTP)
        let signupData = req.session.detail
        if (otp == otpgen) {
            userHelpers.doSignup(signupData).then((response) => {
                console.log(response);
                req.session.user = response.user
                req.session.loggedIn = true
                res.redirect('/')
                // console.log('data added');
            }).catch((response) => {
                signupErr.errMessage = "Email Already Exist !"
                signupErr.status = true
                signupErr.data = response.balData
                // console.log(signupErr);
                res.redirect('/user-signup')
            })
        } else {
            otpErr.message = "Enter valid OTP"
            otpErr.status = true
            res.redirect('/OTP-confermation')
            console.log("otp error");
        }



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
        // if (req.session.user) {
        let userId = req.session.user._id
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

    },
    getCeckout: (req, res) => {
        let userId = req.session.user._id
        let userData = req.session.user
        userHelpers.getCartProducts(userId).then((cartData) => {
            if (cartData) {
                console.log(cartData);
                let productData = cartData.cartItems
                console.log(productData, "=======================");
                res.render('user/checkout', { productData, cartData, userData })

            } else {
                console.log("===========================");
                res.render('user/cart-items')
                // console.log("no cart");
            }
        })


    },
    getProductDetails: (req, res) => {
        let user = req.session.user
        let productId = req.params.id
        productHelpers.getOneProduct(productId).then((data) => {
            let product = data
            let images = data.images
            res.render('user/product-detailes', { product, user ,images})
        })

    },
    getProfile: (req, res) => {
        if (req.session.user) {
            let user = req.session.user
            res.render('user/user-profile', { user })
        } else {
            res.redirect('/user-login')
        }
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
        res.json({status:true})
    },

    //cart session starting
    getAddToCart: (req, res) => {
        if(req.session.user){
            let user = req.session.user
            let productId = req.params.prodId
            let userId = user._id
            console.log(productId, userId)
            userHelpers.addProductToCart(productId, userId).then((data) => {
                // console.log('cart created');
                res.json({status:true})
            })
        }else{
            res.json({status:false})
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
        userHelpers.addProductToOrders(req.body, userAddress, userId)
            .then((response) => {
                let orderId = response.orderId
                let totalAmount = response.totalAmount
                if (req.body.payment == "Cash On Delivery") {
                    res.json({ codStatus: true })

                } else if (req.body.payment == "Online Payment") {
                    userHelpers.generateRazorpay(orderId, totalAmount).then((response) => {
                        console.log('hello');
                        res.json(response)
                    })
                } else {

                }

            }).catch((data) => {
                res.redirect('/view-checkout')
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
            let userData = data[0]
            let products = data[0].orders.products
            // console.log(userData);
            res.render('user/more-about-order', { userData, products })
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
        if(req.session.user){
            let productId = req.params.prodId
            let userId = req.session.user._id
            userHelpers.addProductToWishlist(productId, userId)
            .then((data) => {
                res.json({ status: true })
            }).catch((data)=>{
                res.json({status:false})
            })
        }else{
            res.json('notLogged')
        }
        
    }
}