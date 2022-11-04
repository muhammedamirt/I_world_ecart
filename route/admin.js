const Express = require('express')
const router = Express.Router()
const controller = require ('../controllers/admin')
const multer = require('multer')
const { Router } = require('express')
const upload = multer({ dest: 'uploads/' })
//multer
const store = require('../middlewares/multer')
const bannerStore = require('../middlewares/bannerImages')

router.get('/',controller.getAdminHome)

router.post('/admin-login',controller.postAdminLogin)

router.get('/home',controller.getHome)

router.get('/dashbord',controller.getDashbord)

router.get('/view-products',controller.getProducts)
 
router.get('/view-users',controller.getUsers)
 
router.route('/add-products')
.get(controller.getAddProduct)
.post(store.array("img",3),controller.postAddProduct)

router.route('/edit-product/:id')
.get(controller.getEditProduct)
.post(store.array("img",3),controller.postProductDetailes)

router.get('/delete-product/:id',controller.getDeleteProduct)

router.get('/recover-product/:id',controller.getRecoverProduct)

router.get('/view-categury/:categury',controller.getProductCategury)

router.get('/block-user-account/:id',controller.getBlockUser)

router.get('/unblock-user-account/:id',controller.getUnBlockUser)

router.get('/admin-profile',controller.getAdminProfile)

router.get('/admin-logout',controller.getAdminLogout)

router.get("/view-categury",controller.getViewCategury) 

router.post("/add-categury", controller.postAddCategury)

router.get("/remove-categury/:id",controller.getRemoveCategury)

router.get("/view-orders",controller.getViewOrderse)

router.get('/view-order-more/:userId',controller.getViewOrderMore)

router.post('/change-status/:orderId/:userId',controller.getChangeStatus)

router.post('/cancel-admin-order/:orderId/:userId',controller.getAdminOrderCancel)

router.get('/add-coupon-banner',controller.getAddCouponBanner)

router.post('/add-new-coupon',controller.postAddCoupon)

router.get('/view-coupons',controller.getViewCoupens)

router.get('/remove-coupon/:couponId',controller.getRemoveCoupon)

router.post('/add-banners',bannerStore.array("img",1), controller.postAddBanners)

router.get('/view-banners',controller.getViewBanners)

// router.post('/add-new-banner',store.array("img",3),controller.postAddBanner)

module.exports = router