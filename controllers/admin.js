const productHelpers = require("../helpers/productHelpers")
const multer = require("multer")
const upload = multer({ dest: 'uploads/' })
const adminHelpers = require('../helpers/admin-helpers');
const { response } = require("../app");
const products = require("../models/schema/products");
const categury = require("../models/schema/categury");
const admin = require("../models/schema/admin");



let adminEmailErr = {}
let adminPasswordErr = {}
let availableCategury = {}

module.exports = {

    getAdminHome: (req, res) => {
        if (req.session.admin) {
            // console.log(list);
            res.render('admin/dashbord', { admin: true })
        } else {
            if (adminEmailErr) {
                let emailMessage = adminEmailErr.EmailMessage
                res.render('admin/admin-login', { admin: true, emailMessage })
                adminEmailErr = {}
            } else if (adminPasswordErr) {

                // let passwordMessage = adminPasswordErr.PasswordMessage
                // console.log(passwordMessage,"+++++++++++++++++++++++");
                res.render('admin/admin-login', { admin: true, adminPasswordErr})
                adminPasswordErr = {}

            } else {
                res.render('admin/admin-login', { admin: true })

            }
        }
    },


    postAdminLogin: (req, res) => {
        // console.log(req.body);
        adminHelpers.doAdminLogin(req.body)
            .then((response) => {
                // console.log(response);
                req.session.admin = response.adminData
                req.session.adminLoggedIN = true
                res.redirect('/admin')
            })
            .catch((response) => {
                if (response.emailErr) {
                    // console.log(response.emailErr)
                    adminEmailErr.EmailMessage = "This Email Don't Have Any Account"
                    adminEmailErr.status = true
                    res.redirect('/admin')
                } else {
                    adminPasswordErr.PasswordMessage = 'Your Password is Wrong'
                    adminPasswordErr.status = true
                    // console.log(adminPasswordErr.PasswordMessage);
                    res.redirect('/admin')
                }
                // console.log(response);
            })
    },


    getHome: (req, res) => {
        res.render('admin/index.hbs', { admin: true })
    },


    getDashbord: (req, res) => {
        if (req.session.admin) {
            res.render('admin/dashbord', { admin: true })
        } else {
            res.redirect('/admin')
        }

    },


    getProducts: (req, res) => {
        if (req.session.admin) {
            adminHelpers.getProducts().then((data) => {
                let products = data
                // console.log(products);
                res.render('admin/view-products', { admin: true, products })
            })
        } else {
            res.redirect('/admin')
        }


    },


    getUsers: (req, res) => {
        if (req.session.admin) {
            adminHelpers.getUserDetailes().then((data) => {
                res.render('admin/view-users', { admin: true, data })
            })
        } else {
            res.redirect('/admin')
        }


    },


    getAddProduct: (req, res) => {
        if (req.session.admin) {
            // let categury = productHelpers.getCateguryList().then((data)=>{
            res.render('admin/add-products', { admin: true })
            // })

        } else {
            res.redirect('/admin')
        }

    },


    postAddProduct: (req, res) => {
        console.log(req.body);
        // console.log("========================");
        // console.log(req.files);
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


    },


    getEditProduct: (req, res) => {
        if (req.session.admin) {
            let productId = req.params.id
            productHelpers.getOneProduct(productId).then((data) => {
                // console.log("===================" + data);
                res.render('admin/edit-product', { admin: true, data })
            })
        } else {
            res.redirect('/admin')
        }

    },


    postProductDetailes: (req, res) => {
        let prodId = req.params.id
        console.log(req.body);
        productHelpers.editProduuctDetailes(prodId, req.body).then((data) => {
            res.redirect('/admin/view-products')
        })
    },


    getDeleteProduct: (req, res) => {
        if (req.session.admin) {
            let prodId = req.params.id
            productHelpers.deleteProduct(prodId).then((data) => {
                res.redirect('/admin/view-products')
            })
        } else {
            res.redirect('/admin')
        }

    },


    getProductCategury: (req, res) => {
        if (req.session.admin) {
            let categury = req.params.categury
            productHelpers.getProductCategury(categury).then((data) => {
                let products = data
                res.render('admin/view-products', { admin: true, products })

            })
        } else {
            res.redirect('/admin')
        }

    },


    getBlockUser: (req, res) => {
        if (req.session.admin) {
            let userId = req.params.id
            adminHelpers.blockUserAccount(userId)
                .then((data) => {
                    console.log("User Blocked");
                    res.redirect('/admin/view-users')
                })
        } else {
            res.redirect('/admin')
        }


    },


    getUnBlockUser: (req, res) => {
        if (req.session.admin) {
            let userId = req.params.id
            adminHelpers.unblockUserAccount(userId)
                .then((data) => {
                    console.log("User Unblocked");
                    res.redirect('/admin/view-users')
                })
        } else {
            res.redirect('/admin')
        }

    },


    getAdminProfile: (req, res) => {
        if (req.session.admin) {
            let admin = req.session.admin
            res.render('admin/admin-profile', { admin })
        } else {
            res.redirect('/admin')
        }
    },


    getAdminLogout: (req, res) => {
        if (req.session.admin) {
            req.session.admin = null
            req.session.adminLoggedIN = false
            res.redirect("/admin")
        } else {
            res.redirect('/admin')
        }
    },


    getViewCategury: (req, res) => {
        productHelpers.getCateguryList().then((data) => {
            let categury = data
            console.log(categury);
            if (availableCategury.status) {
                let message = availableCategury.message
                res.render('admin/add-view-categury', { admin: true, categury, message })
                availableCategury = {}
            } else {
                res.render('admin/add-view-categury', { admin: true, categury })
            }

        })

    },


    postAddCategury: (req, res) => {
        if (req.session.admin) {
            console.log(req.body);
            let categury = req.body
            productHelpers.addNewCategury(categury).then((data) => {
                res.redirect('/admin/view-categury')
            }).catch((categuryExist) => {
                // console.log(categuryExist);
                availableCategury.message = "Category Is Alredy Available"
                availableCategury.status = true
                res.redirect('/admin/view-categury')
            })

        } else {
            res.redirect('/admin')
        }
    },


    getRemoveCategury: (req, res) => {
        let id = req.params.id
        productHelpers.removeCategury(id).then((data) => {
            res.redirect('/admin/view-categury')
        })
    },

    
    getViewOrderse: (req, res) => {
        if (req.session.admin) {
            adminHelpers.getAllOrders().then((orderData)=>{
                // console.log(orderData);

                res.render('admin/view-orders', { admin: true , orderData })
            })

           
        } else {
            res.redirect('/admin')
        }
    },

    getViewOrderMore: (req,res)=>{
        if(req.session.admin){
            let userId = req.params.userId
            // console.log(userId);
            adminHelpers.getOneUserOrder(userId).then((userOrder)=>{
                // console.log(userOrder);
                let products =userOrder[0].orders.products
                // console.log(products);
                res.render('admin/view-order-more',{admin:true,products,userOrder})
            })
        }else{
            res.redirect('/admin')
        }
        
        
    },
    getChangeStatus:(req,res)=>{
        let orderId = req.params.orderId
        let userId = req.params.userId
        let status = req.body.paymentStatus
        if(req.session.admin){
            adminHelpers.changeOrderStatus(orderId,userId,status).then((data)=>{
                res.redirect('/admin/view-order-more/'+orderId)
            })
        }else{
            res.redirect('/admin')
        }
        
       
    },
    getAdminOrderCancel:(req,res)=>{
        let orderId = req.params.orderId
        let userId = req.params.userId
        if(req.session.admin){
            adminHelpers.orderCanceleAdmin(orderId,userId).then((data)=>{
                res.json({status:true})
            })
        }else{
            res.redirect('/admin')
        }
        
    }
} 