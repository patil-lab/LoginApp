"use strict";

const bcrypt = require("bcryptjs");
var db = require("../models/index");
const User = db.Person;
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const passport = require("passport");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function createUser(req, res) {
  try {
    const { firstName, lastName, email, password, confirm } = req.body;
    let errors = [];
    const re = new RegExp(
      "/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/"
    );
    console.log(password, confirm);
    if (password != confirm) {
      errors.push("Passwords must match to Proceed");
    }
    /**
     * TODO implement regex check
     */

    if (!re.test(password)) {
      console.log(re.test(password));
      console.log(password.match(re));
      errors.push("Password must contain at least one lower character");
      errors.push("Password must contain at least one upper character");
      errors.push("Password must contain at least one digit character");
      errors.push("Password must contain at least one special character");
      errors.push("Password must contain at least one 8 character");
    }

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
          const token = crypto.randomBytes(64).toString("hex");
          const newUser = User.build({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            isVerified: false,
            token: token,
          });

          //Password Hashing
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) {
                throw err;
              }
              newUser.password = hash;
              newUser
                .save()
                .then(sendEmail(req, res, token))
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
}

async function resendEmail(req, res) {
  const { email } = req.body;
  User.findOne({ where: { email: email } }).then((user) => {
    const token = user.token;
    sendEmail(req, res, token);
  });
}

async function sendEmail(req, res, token) {
  const { email } = req.body;
  const senderMail = process.env.SENDER_EMAIL;
  const myUrl = new URL(process.env.BASE_URL);

  const url = myUrl + "verify?token=" + token;
  const msg = {
    to: email,
    from: senderMail,
    subject: "Email Verfication",
    text: "Please click link to verify account ",
    html: "<b><a href=" + url + ">Verify email</a><b>",
  };
  sgMail
    .send(msg)
    .then(() => {
      req.flash("message", " Please check your email to verify your account");
      res.redirect("/sendEmail");
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
}

async function verifyUser(req, res) {
  try {
    const user = await User.findOne({ where: { token: req.query.token } });
    if (!user) {
      req.flash(
        "message",
        "Token is invalid . Please contact us for assistance"
      );
      res.redirect("/");
    } else {
      user.token = null;
      user.isVerified = true;
      user.loggedIn += 1;
      user.lastSession = Date.now();
      const newUser = await user.save();
      req.login(newUser, (err) => {
        if (err) {
          // Session save went bad
          return next(err);
        }
        // All good, we are now logged in and `req.user` is now set
        res.redirect("/dashboard");
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
}

async function logoutUserPost(req, res, next) {
  const email = req.body.email;
  updateUser(email);
  req.logOut();
  req.session.destroy((err) => res.redirect("/"));
}

function createNewUser(profile, registrationType) {
  const user = User.create({
    socialUserId: profile.id,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    registrationType: registrationType,
    email: profile.emails[0].value,
    isVerified: true,
    loggedIn: 1,
    lastSession: Date.now(),
  });

  return user;
}

async function getUserByEmail(email) {
  return User.findOne({
    where: { email: email },
  });
}

async function updateUser(email) {
  const user = await getUserByEmail(email);
  user.lastSession = null;
  user.save();
}

async function resetPassword(req, res) {
  const { oldPwd, newPwd, rPwd } = req.body;
  const email = req.user.email;
  User.findOne({
    where: { email: email },
  }).then((user) => {
    if (user) {
      if (user.password == null) {
        req.flash(
          "message",
          "You dont have password set. Please set new password!"
        );
        res.redirect("/dashboard");
      }
      bcrypt.compare(oldPwd, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          if (newPwd != rPwd) {
            req.flash("message", "New Passwords must match to proceed");
            res.redirect("/reset");
          } else {
            /**
             * TODO implement regex check
             */

            /*      if(!re.test(password)){
            console.log(re.test(password))
            console.log(password.match(re))
            errors.push("Password must contain at least one lower character")
            errors.push("Password must contain at least one upper character")
            errors.push("Password must contain at least one digit character")
            errors.push("Password must contain at least one special character")
            errors.push("Password must contain at least one 8 character")
        } */
            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newPwd, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash;
                user
                  .save()
                  .then(() => {
                    req.flash("message", "Password reset successfull!");
                    res.redirect("/dashboard");
                  })
                  .catch((err) => console.log(err));
              })
            );
          }
        } else {
          req.flash("message", "Old Password is incorrect");
          res.redirect("/reset");
        }
      });
    }
  });
}

async function setPwdPost(req, res) {
  const { newPwd } = req.body;
  const email = req.user.email;
  User.findOne({
    where: { email: email },
  }).then((user) => {
    if (user) {
      if (user.password != null) {
        req.flash(
          "message",
          "You have a password set .Please reset if you wish to!"
        );
        res.redirect("/dashboard");
      } else {
        /**
         * TODO implement regex check
         */
        /*      if(!re.test(password)){
            console.log(re.test(password))
            console.log(password.match(re))
            errors.push("Password must contain at least one lower character")
            errors.push("Password must contain at least one upper character")
            errors.push("Password must contain at least one digit character")
            errors.push("Password must contain at least one special character")
            errors.push("Password must contain at least one 8 character")
        } */
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newPwd, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user
              .save()
              .then(() => {
                req.flash("message", "Password set successfully!");
                res.redirect("/dashboard");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    }
  });
}

async function resetNamePostCall(req, res) {
  const { firstName, lastName } = req.body;
  const email = req.user.email;
  User.findOne({
    where: { email: email },
  }).then((user) => {
    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user
        .save()
        .then(() => {
          req.flash("message", "Name Reset successfully!");
          res.redirect("/dashboard");
        })
        .catch((err) => console.log(err));
    }
  });
}

module.exports = {
  createUser,
  verifyUser,
  logoutUserPost,
  createNewUser,
  getUserByEmail,
  resetPassword,
  setPwdPost,
  sendEmail,
  resetNamePostCall,
  resendEmail,
};
