// helpers & collectionss
const productHelpers = require("../helpers/productHelpers")
const adminHelpers = require('../helpers/admin-helpers');
const productCollection = require("../models/schema/products");
//http modules
const fs = require('fs')
const path = require('path')
//some validation proccess
let adminEmailErr = {}
let adminPasswordErr = {}
let availableCategury = {}

module.exports = {
    //home page , authentication & main pages
    getAdminHome: (req, res) => {
        try {
            if (req.session.admin) {
                res.redirect('/admin/dashbord')
            } else {
                if (adminEmailErr) {
                    let emailMessage = adminEmailErr.EmailMessage
                    res.render('admin/admin-login', { admin: true, emailMessage })
                    adminEmailErr = {}
                } else if (adminPasswordErr) {
                    res.render('admin/admin-login', { admin: true, adminPasswordErr })
                    adminPasswordErr = {}
                } else {
                    res.render('admin/admin-login', { admin: true })
                }
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }

    },
    postAdminLogin: (req, res) => {
        try {
            adminHelpers.doAdminLogin(req.body)
                .then((response) => {
                    req.session.admin = response.adminData
                    req.session.adminLoggedIN = true
                    res.json({ status: true })
                })
                .catch((response) => {
                    if (response.emailErr) {
                        adminEmailErr.EmailMessage = "This Email Don't Have Any Account"
                        adminEmailErr.status = true
                        res.json({ emailErr: true })
                    } else {
                        adminPasswordErr.PasswordMessage = 'Your Password is Wrong'
                        adminPasswordErr.status = true
                        res.json({ passwordErr: true })
                    }
                })
        } catch (err) {
            res.redirect('/admin/500-error')
        }

    },
    getDashbord: async (req, res) => {
        try {
            if (req.session.admin) {
                let codAndOp;
                let OpAndCod;
                let orderData;
                let income;
                let cancelOrders;
                let ordersCount;
                let salesReport;
                await adminHelpers.getDashbordDataCod().then((data) => {
                    codAndOp = data
                })

                await adminHelpers.getDashbordDataOP().then((data) => {
                    OpAndCod = data
                })

                await adminHelpers.getDashordOrderData().then((data) => {
                    orderData = data
                })

                await adminHelpers.getDashbordIncome().then((data) => {
                    income = data
                })

                await adminHelpers.getOrdersAndCanceldOrders().then((data) => {
                    cancelOrders = data.canceldOrders
                    ordersCount = data.successOrders
                })
                await adminHelpers.getSalesReport().then((data) => {

                    for (let i = 0; i < data.length; i++) {
                        data[i].profit = Number(data[i].totalPrice) * 50 / 100
                        data[i].proggress = Number(data[i].totalPrice) - Number(data[i].profit)
                    }
                    salesReport = data
                })


                res.render('admin/dashbord', { admin: true, codAndOp, OpAndCod, orderData, income, cancelOrders, ordersCount, salesReport })

            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }


    },
    getProducts: (req, res) => {
        try {
            if (req.session.admin) {
                adminHelpers.getProducts().then((data) => {
                    let products = data
                    res.render('admin/view-products', { admin: true, products })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getUsers: (req, res) => {
        try {
            if (req.session.admin) {
                adminHelpers.getUserDetailes().then((data) => {
                    res.render('admin/view-users', { admin: true, data })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getAddProduct: (req, res) => {
        try {
            if (req.session.admin) {
                productHelpers.getCateguryList().then((data) => {
                    res.render('admin/add-products', { admin: true, data })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    // product managnment
    postAddProduct: (req, res) => {
        try {
            let files = req.files
            if (files) {
                const images = []
                for (i = 0; i < req.files.length; i++) {
                    images[i] = files[i].filename
                }
                req.body.img = images
                productHelpers.addProduct(req.body).then((data) => {
                    res.redirect("/admin/view-products")
                })
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getEditProduct: (req, res) => {
        try {
            if (req.session.admin) {
                let productId = req.params.id
                productHelpers.getOneProduct(productId).then((data) => {
                    res.render('admin/edit-product', { admin: true, data })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    postProductDetailes: async (req, res) => {
        try {
            let prodId = req.params.id
            let images = []
            if (req.files.length !== 0) {
                for (file of req.files) {
                    images.push(file.filename)
                }
                // remove old
                let product = await productCollection.findById(prodId)
                let imagePath = path.join(__dirname, '../', '/public', '/product-images')
                for (let i = 0; i < product.images.length; i++) {
                    fs.unlinkSync(`${imagePath}/${product.images[i]}`);
                }
                product.images = images
                product.save()
            }
            productHelpers.editProduuctDetailes(prodId, req.body).then((data) => {
                res.redirect('/admin/view-products')
            })
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getDeleteProduct: (req, res) => {
        try {
            if (req.session.admin) {
                let prodId = req.params.id
                productHelpers.deleteProduct(prodId).then((data) => {
                    res.redirect('/admin/view-products')
                })
            } else {
                res.redirect('/admin')
            }

        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getRecoverProduct: (req, res) => {
        try {
            if (req.session.admin) {
                let prodId = req.params.id
                productHelpers.recoverProduct(prodId).then((data) => {
                    res.redirect('/admin/view-products')
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getProductCategury: (req, res) => {
        try {
            if (req.session.admin) {
                let categury = req.params.categury
                productHelpers.getProductCategury(categury).then((data) => {
                    let products = data
                    res.render('admin/view-products', { admin: true, products })

                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    // user managment
    getBlockUser: (req, res) => {
        try {
            if (req.session.admin) {
                let userId = req.params.id
                adminHelpers.blockUserAccount(userId)
                    .then((data) => {
                        res.redirect('/admin/view-users')
                    })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getUnBlockUser: (req, res) => {
        try {
            if (req.session.admin) {
                let userId = req.params.id
                adminHelpers.unblockUserAccount(userId)
                    .then((data) => {
                        res.redirect('/admin/view-users')
                    })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getAdminProfile: (req, res) => {
        try {
            if (req.session.admin) {
                let admin = req.session.admin
                res.render('admin/admin-profile', { admin })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getAdminLogout: (req, res) => {
        try {
            if (req.session.admin) {
                req.session.admin = null
                req.session.adminLoggedIN = false
                res.redirect("/admin")
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    // category managment
    getViewCategury: (req, res) => {
        try {
            productHelpers.getCateguryList().then((data) => {
                let categury = data
                if (availableCategury.status) {
                    let message = availableCategury.message
                    res.render('admin/add-view-categury', { admin: true, categury, message })
                    availableCategury = {}
                } else {
                    res.render('admin/add-view-categury', { admin: true, categury })
                }
            })
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    postAddCategury: (req, res) => {
        try {
            if (req.session.admin) {
                let categury = req.body
                productHelpers.addNewCategury(categury).then((data) => {
                    res.redirect('/admin/view-categury')
                }).catch((categuryExist) => {
                    availableCategury.message = "Category Is Alredy Available"
                    availableCategury.status = true
                    res.redirect('/admin/view-categury')
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getRemoveCategury: (req, res) => {
        try {
            let id = req.params.id
            productHelpers.removeCategury(id).then((data) => {
                res.redirect('/admin/view-categury')
            })
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    //order managment
    getViewOrderse: (req, res) => {
        try {
            if (req.session.admin) {
                adminHelpers.getAllOrders().then((orderData) => {
                    res.render('admin/view-orders', { admin: true, orderData })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getViewOrderMore: (req, res) => {
        try {
            if (req.session.admin) {
                let userId = req.params.userId
                adminHelpers.getOneUserOrder(userId).then((userOrder) => {
                    let products = userOrder[0].orders.products
                    res.render('admin/view-order-more', { admin: true, products, userOrder })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getChangeStatus: (req, res) => {
        try {
            let orderId = req.params.orderId
            let userId = req.params.userId
            let status = req.body.paymentStatus
            if (req.session.admin) {
                adminHelpers.changeOrderStatus(orderId, userId, status).then((data) => {
                    res.redirect('/admin/view-order-more/' + orderId)
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getAdminOrderCancel: (req, res) => {
        try {
            let orderId = req.params.orderId
            let userId = req.params.userId
            if (req.session.admin) {
                adminHelpers.orderCanceleAdmin(orderId, userId).then((data) => {
                    res.json({ status: true })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    // coupon managment
    getAddCouponBanner: (req, res) => {
        try {
            if (req.session.admin) {
                res.render('admin/add-coupon-banner', { admin: true })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    postAddCoupon: (req, res) => {
        try {
            if (req.session.admin) {
                adminHelpers.addCouponToCollection(req.body).then((data) => {
                    res.json({ status: true })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getViewCoupens: (req, res) => {
        try {
            if (req.session.admin) {
                adminHelpers.getAllCouponse().then((data) => {
                    res.render('admin/view-coupons', { admin: true, data })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getRemoveCoupon: (req, res) => {
        try {
            if (req.session.admin) {
                adminHelpers.removeCoupon(req.params.couponId).then((data) => {
                    res.json({ status: true })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    // banner managment
    postAddBanners: (req, res) => {
        try {
            if (req.session.admin) {
                let image = req.files[0].filename
                req.body.img = image
                adminHelpers.addBanner(req.body).then((data) => {
                    res.redirect('/admin/view-banners')
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    },
    getViewBanners: (req, res) => {
        try {
            if (req.session.admin) {
                adminHelpers.getBannerList().then((data) => {
                    res.render('admin/view-banners', { data, admin: true })
                })
            } else {
                res.redirect('/admin')
            }
        } catch (err) {
            res.redirect('/admin/500-error')
        }
    }
} 