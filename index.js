const express = require("express");
const cookieParser=require('cookie-parser')
const session = require("express-session");
const path = require("path");
const app = express();
require('https').globalAgent.options.rejectUnauthorized = false;
const flash = require("connect-flash");
const db = require("./models/database");
const User = require("./models/User");

const passport = require("passport");

app.use(cookieParser())
app.set("views", path.join(__dirname, "views"));
app.set("view-engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const { loginCheck } = require("./config/passport-config");
loginCheck(passport);
const oneYear=1000*60*60*24*365
app.use(
  session({
    secret: "flashblog",
    saveUninitialized: true,
    resave: false,
    cookie: {maxAge:oneYear}
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

const port = 3000;

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger/swagger");

//Routes
app.use("/", require("./router/login"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

db.sequelize.sync({force:true}).then((req) => {
  app.listen(port,"localhost", () => {
    console.log(" Server running!!");
  });
});
