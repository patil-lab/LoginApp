
var https = require('https');
const { v4: uuidv4 } = require('uuid');
const express = require("express");
const cookieParser=require('cookie-parser')
const session = require("express-session");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const MySQLStore=require('express-mysql-session')(session)
const flash = require("connect-flash");
const passport = require("passport");
require('dotenv').config()

app.set("views", path.join(__dirname, "views"));
app.set("view-engine", "ejs");
app.use(express.static(path.join(__dirname, 'views/public')))
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false })); 
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];
console.log(config)
const { loginCheck } = require("./config/passport-config");

var options

if(env=='development'){
 options ={
  host:'localhost',
  port:3306,
  user:'root',
  password:'root',
  database:'logindb'
}
}else{
  options ={
    host:'us-cdbr-east-06.cleardb.net',
    port:3306,
    user:'b32e8159690508',
    password:'01ad9d40',
    database:'heroku_52a1aff1bb1bbdf'
  }
}
app.use(cookieParser("LoginAppSecret"))
const oneYear=1000*60*60*24*365
const sessionStore=new MySQLStore(options)
app.use(
  session({
    genid: (req) => {
      console.log('Inside the session middleware')
      console.log(req.sessionID)
      return uuidv4(); // use UUIDs for session IDs
    },
    key:'session_cookie_name',
    store:sessionStore,
    secret: "LoginAppSecret",
    saveUninitialized: false,
    resave: false,
    //cookie: {maxAge:oneYear,httpOnly:true}
  })
);



app.use(flash());
app.use(function (request, response, next) {
  response.locals.message = request.flash("message");
  response.locals.errors = request.flash("error");
  
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
loginCheck(passport);

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger/swagger");

//Routes
app.use("/", require("./router/login"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


  if(process.env.NODE_ENV=='production'){
    app.listen(process.env.PORT, "0.0.0.0", function() {
      console.log("Server started.......");
    });
  }else{
    app.listen(process.env.PORT,"localhost", () => {
      console.log(" Server running!!");
    });
  }

