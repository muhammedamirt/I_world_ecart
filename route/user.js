const Express = require('express')
const router = Express.Router()

const loginChech = require('../Login-check/user-login')

const userControllers = require('../controllers/user')



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

router.get('/view-cart', loginChech, userControllers.getCart)

router.get('/view-checkout', loginChech, userControllers.getCeckout)

router.post('/order-placement', loginChech, userControllers.postOrderDetailes)

router.get('/product-detials/:id', userControllers.getProductDetails)

router.get('/view-wishlist', loginChech, userControllers.getWishlist)

router.get('/view-profile', loginChech, userControllers.getProfile)

router.get('/edit-profile', userControllers.getEditProfile)

router.post('/edit-profile/:id', loginChech, userControllers.postEditProfile)

router.post('/filter-product', userControllers.filterProduct)

router.get('/user-logout', loginChech, userControllers.getUserLogout)

router.route('/add-to-cart/:prodId')
    .get(loginChech, userControllers.getAddToCart)
    .post(loginChech, userControllers.postAddToCart)

router.get('/remove-cart-product/:id', loginChech, userControllers.getRemoveCartProduct)

router.get('/cartquantityinc/:id', loginChech, userControllers.getIncQuantity)

router.get('/cartquantitydec/:id', loginChech, userControllers.getdcrQuantity)

router.get('/viewUserOrders', loginChech, userControllers.getViewOrders)

router.get('/more-about-order/:orderId', loginChech, userControllers.getMoreAboutOrder)

router.post('/cancel-user-order/:orderId', loginChech, userControllers.getUserOrderCancel)

router.post('/verify-payment',userControllers.postVerifyPayment)

// router.get('/reorder-user-order/:orderId',userControllers.getUserReOrder)






module.exports = router
