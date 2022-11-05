//js
const express = require("express");
const passport = require('passport');
const {
  registerView,
  loginView,
  registerUser,
  verifyEmail,
  homePageView,
  loginUser,
  logoutUser,
  resetView,
  resetPost,
  setPasswordView,
  setPasswordPost
} = require("../controller/loginController");
const {ensureAuthenticated,forwardAuthenticated}=require('../config/auth')
const router = express.Router();

router.get("/", forwardAuthenticated,homePageView);
router.get("/register",forwardAuthenticated, registerView);
router.get("/login", forwardAuthenticated,loginView);
router.get("/reset",ensureAuthenticated,resetView)
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
passport.authenticate('google', { 
  failureRedirect: '/login',successRedirect: '/dashboard', 
  failureMessage: true }));

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

router.post("/reset",resetPost)

router.get('/setPassword',setPasswordView)

router.post('/setPassword',setPasswordPost)