const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const flash = require("connect-flash");
const passport = require("passport");

app.set("views", path.join(__dirname, "views"));
app.set("view-engine", "ejs");

require("./config/passport-config")(passport);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "flashblog",
    saveUninitialized: false,
    resave: false,
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (request, response, next) {
  response.locals.message = request.flash("message");
  response.locals.errors = request.flash("error");
  next();
});

const db = require("./models/database");
const User = require("./models/User");

const port = 3000;

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger/swagger");

//Routes
app.use("/", require("./router/login"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

db.sequelize.sync().then((req) => {
  app.listen(port, () => {
    console.log("Server running!!");
  });
});
