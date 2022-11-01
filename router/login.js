//js
const express = require("express");
const passport = require('passport');
const {
  registerView,
  loginView,
  registerUser,
  verifyEmail,
  homePageView,
  dashboardView,
  loginUser,
  logoutUser
} = require("../controller/loginController");
const ensureAuthenticated=require('../config/auth').ensureAuthenticated
const router = express.Router();

router.get("/", homePageView);
router.get("/register", registerView);
router.get("/login", loginView);

router.post("/register", registerUser);
router.get("/verify", verifyEmail);
router.get("/dashboard", ensureAuthenticated,(req, res) => {
  res.render("dashboard.ejs", {user : req.user});
});
router.post("/login", loginUser);
//Google Oauth
router.get('/auth/google', 
passport.authenticate('google', { scope : ['profile', 'email'] }));
router.get('/auth/google/callback', 
passport.authenticate('google', { failureRedirect: '/error', failureMessage: true }),
function(req, res) {
  // Successful authentication, redirect success.
  res.redirect('/dashboard');
});

//Facebook Oauth
router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
  }));

  router.get('/logout',logoutUser)
module.exports = router;
