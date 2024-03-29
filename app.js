require('dotenv').config();

const Express = require('express');
const path = require('path')
const app = Express();

const userRouter = require('./route/user');
const adminRouter = require('./route/admin')
const hbs = require('express-handlebars');
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const session = require('express-session')
const cookieParser = require('cookie-parser')
const nocache = require('nocache')

const Handilebars = require('handlebars')

const Swal = require('sweetalert2')

Handilebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handilebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});


const error = (err, req, res, next) => {
  if (err) {
  }
  next()
}

app.use(Express.static(__dirname))
app.use(Express.json())

app.set('views', path.join(__dirname, "views"))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutDir: __dirname + '/views/layouts/',
  partialDir: __dirname + '/views/partials/'
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(Express.static(path.join(__dirname, "public")))

app.use(cookieParser())



app.use(session({
  secret: "keyIsHear",
  saveUninitialized: true,
  cookie: { maxAge: 60000 * 30 },
  resave: false
}))

app.use(nocache())

// app.use(fileUpload())



app.use('/admin', adminRouter)
app.use('/', userRouter)


app.use(error)

//Connecting to database

mongoose.connect(process.env.ATLES_CONNECTION)
  .then(data => {
    console.log("Database Connected")
  }).catch(err => console.log(err))



app.listen(5500, () => {
  let started = true
})





module.exports = app
