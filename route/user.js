const Express = require('express')
const router = Express.Router()

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

router.get('/view-cart', userControllers.getCart)

router.get('/view-checkout', userControllers.getCeckout)

router.post('/order-placement', userControllers.postOrderDetailes)

router.get('/product-detials/:id', userControllers.getProductDetails)

router.get('/view-wishlist', userControllers.getWishlist)

router.get('/view-profile', userControllers.getProfile)

router.get('/edit-profile', userControllers.getEditProfile)

router.post('/edit-profile/:id', userControllers.postEditProfile)

router.post('/filter-product', userControllers.filterProduct)

router.get('/user-logout', userControllers.getUserLogout)

router.route('/add-to-cart/:prodId')
    .get(userControllers.getAddToCart)
    .post(userControllers.postAddToCart)

router.get('/remove-cart-product/:id', userControllers.getRemoveCartProduct)

router.get('/cartquantityinc/:id', userControllers.getIncQuantity)

router.get('/cartquantitydec/:id', userControllers.getdcrQuantity)

router.get('/viewUserOrders',userControllers.getViewOrders)

router.get('/more-about-order/:orderId',userControllers.getMoreAboutOrder)






module.exports = router
