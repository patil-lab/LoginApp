var https = require("https");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const MySQLStore = require("express-mysql-session")(session);
const flash = require("connect-flash");
const passport = require("passport");
require("dotenv").config();

/**
 * set views
 */
app.set("views", path.join(__dirname, "views"));
app.set("view-engine", "ejs");
/**
 * set static files
 */
app.use(express.static(path.join(__dirname, "views/public")));
app.use(express.json());
// body parser
app.use(bodyParser.urlencoded({ extended: false }));
// env variables
const env = process.env.NODE_ENV || "development";
const config = require("./config/config.json")[env];

//passport config
const { loginCheck } = require("./config/passport-config");

//options for session store
const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
};
app.use(cookieParser("LoginAppSecret"));
const oneYear = 1000 * 60 * 60 * 24 * 365;
const sessionStore = new MySQLStore(options);

//use express session
app.use(
  session({
    genid: (req) => {
      console.log("Inside the session middleware");
      console.log(req.sessionID);
      return uuidv4(); // use UUIDs for session IDs
    },
    key: "loginAppSession",
    store: sessionStore,
    secret: "LoginAppSecret",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: oneYear,
      httpOnly: true,
    },
  })
);

//use flash
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

// swagger ui settings
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger/swagger");
const { NONAME } = require("dns");

//Routes
app.use("/", require("./router/login"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (process.env.NODE_ENV == "production") {
  app.listen(process.env.PORT, "0.0.0.0", function () {
    console.log("Server started.......");
  });
} else {
  app.listen(process.env.PORT, "localhost", () => {
    console.log(" Server running!!");
  });
}
