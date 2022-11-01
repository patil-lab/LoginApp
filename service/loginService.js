"use strict"

const bcrypt = require("bcrypt");
var db = require("../models/database");
const User = db.User;
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const passport = require('passport');
require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var session;
async function createUser(req, res) {
  try {
    const { firstName, lastName, email, password, confirm } = req.body;
    let errors = [];
    const re = new RegExp(
      "/^(?=.*[A-Z])(?=.*[a-z])(?=.*d)(?=.*[^A-Za-z0-9])(?=.{8,}).*$/"
    );
    console.log(password, confirm);
    if (password != confirm) {
      errors.push("Passwords must match to Proceed");
    }

    /*      if(!re.test(password)){
            console.log(re.test(password))
            console.log(password.match(re))
            errors.push("Password must contain at least one lower character")
            errors.push("Password must contain at least one upper character")
            errors.push("Password must contain at least one digit character")
            errors.push("Password must contain at least one special character")
            errors.push("Password must contain at least one 8 character")
        } */

    if (errors.length > 0) {
      res.render("register.ejs", { errors });
    } else {
      User.findOne({
        where: { email: email },
      }).then((user) => {
        if (user) {
          errors.push("Email already used,try with different email");
          res.render("register.ejs", { errors });
        } else {
          const senderMail = "patil@funpodium.net";
          const token = crypto.randomBytes(64).toString("hex");
          const newUser = User.build({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            isVerified: false,
            token: token,
          });

          const myUrl = new URL("http://localhost:3000");
          const url = myUrl + "verify?token=" + token;
          const msg = {
            to: email, // Change to your recipient
            from: senderMail, // Change to your verified sender
            subject: "Email Verfication",
            text: "Please click link to verify account ",
            html: "<b><a href=" + url + ">Verify email</a><b>",
          };
          //Password Hashing
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(
                  sgMail
                    .send(msg)
                    .then(() => {
                      req.flash(
                        "message",
                        "Thanks for registering . Please check your account to verify your account"
                      );
                      res.redirect("/");
                      console.log("Email sent");
                    })
                    .catch((error) => {
                      console.error(error);
                    })
                )
                .catch((err) => console.log(err));
            })
          );
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
};

async function verifyUser(req, res) {
  try {
    const user = await User.findOne({ where: { token: req.query.token } });
    if (!user) {
      req.flash(
        "message",
        "Token is invalid . Please contact us for assistance"
      );
      res.redirect("/");
    }
    user.token = null;
    user.isVerified = true;
    await user.save();
    req.flash(
      "message",
      "Welcome to Login App " +
        user.firstName +
        " Please login to see the dashboard"
    );
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

async function loginUserPost(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect:'/login',
    failureFlash: true
    
  })(req,res,next);
};

async function logoutUserPost(req,res,next){
  console.log(req.session)
  req.logOut()
  res.redirect('/login')
}




module.exports={createUser,verifyUser,loginUserPost,logoutUserPost}