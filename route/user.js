const Express = require('express')
const router = Express.Router()
const loginCheck = require('../Login-check/user-login')
const userControllers = require('../controllers/user')
const accessCheck = require('../Login-check/user-active')



router.get('/', userControllers.getHome)

router.route('/user-login')
    .get(userControllers.getLogin)
    .post(userControllers.postLogin)

router.route('/user-signup')
    .get(userControllers.getSignup)
    .post(userControllers.postSignup)

router.post("/post-otp", userControllers.postOtp)

router.get("/OTP-confermation", userControllers.getOtpConfermation)

router.get('/user-shop', userControllers.getShop)

router.get('/view-cart', loginCheck, accessCheck, userControllers.getCart)

router.get('/view-checkout', loginCheck, accessCheck, userControllers.getCeckout)

router.post('/order-placement', loginCheck, accessCheck, userControllers.postOrderDetailes)

router.get('/product-detials/:id/:category', userControllers.getProductDetails)

router.get('/view-wishlist', loginCheck, accessCheck, userControllers.getWishlist)

router.get('/view-profile', loginCheck, accessCheck, userControllers.getProfile)

router.get('/edit-profile', loginCheck, accessCheck, userControllers.getEditProfile)

router.post('/edit-profile/:id', loginCheck, accessCheck, userControllers.postEditProfile)

router.post('/filter-product', userControllers.filterProduct)

router.get('/user-logout', loginCheck, accessCheck, userControllers.getUserLogout)

router.route('/add-to-cart/:prodId')
    .get(loginCheck, accessCheck, userControllers.getAddToCart)
    .post(loginCheck, accessCheck, userControllers.postAddToCart)

router.get('/remove-cart-product/:id', loginCheck, accessCheck, userControllers.getRemoveCartProduct)

router.get('/cartquantityinc/:id', loginCheck, accessCheck, userControllers.getIncQuantity)

router.get('/cartquantitydec/:id', loginCheck, accessCheck, userControllers.getdcrQuantity)

router.get('/viewUserOrders', loginCheck, accessCheck, userControllers.getViewOrders)

router.get('/more-about-order/:orderId', loginCheck, accessCheck, userControllers.getMoreAboutOrder)

router.post('/cancel-user-order/:orderId', loginCheck, accessCheck, userControllers.getUserOrderCancel)

router.post('/verify-payment', loginCheck, accessCheck, userControllers.postVerifyPayment)

router.get('/add-to-wishlist/:prodId', loginCheck, accessCheck, userControllers.getAddProductToWishlist)

router.get('/view-contact', userControllers.getViewContact)

router.post('/coupon-submission', loginCheck, accessCheck, userControllers.getCouponSubmission)

router.post('/edit-address', loginCheck, accessCheck, userControllers.postEditAddress)

router.get('/remove-frome-wishlist/:productId', loginCheck, accessCheck, userControllers.getRemoveWishlist)

router.get('/download-invoice/:orderId', loginCheck, accessCheck, userControllers.downloadInvoce)

router.get('/select-address/:addressId', loginCheck, accessCheck, userControllers.getSelectAddress)

router.get('/manage-address', loginCheck, accessCheck, userControllers.getManageAddress)

router.route('/add-new-address')
    .get(userControllers.getAddAdress)
    .post(userControllers.postAddAddress)

router.get('/remove-address/:addressId', userControllers.getRemoveAddress)

router.get('/internal-server-error', (req, res) => {
    res.status(500).render('user/500-error-page', { error: true })
})

router.get('*', function (req, res) {
    res.status(404).render('user/404-error-page', { error: true })
});






module.exports = router
