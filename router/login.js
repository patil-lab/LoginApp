//js
const express = require("express");
const passport = require("passport");
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
  setPasswordPost,
  sendEmailView,
  sendMail,
  resetNamePost,
} = require("../controller/loginController");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const router = express.Router();

router.get("/", forwardAuthenticated, homePageView);
router.get("/register", forwardAuthenticated, registerView);
router.get("/login", forwardAuthenticated, loginView);
router.get("/reset", ensureAuthenticated, resetView);
router.post("/register", registerUser);
router.get("/verify", verifyEmail);
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard.ejs", { user: req.user });
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
    failureFlash: true,
  }),
  function (req, res) {
    if (req.user.isVerified) res.redirect("/dashboard");
    else res.redirect("/sendEmail");
  }
);
//Google Oauth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/register",
    successRedirect: "/setPassword",
    failureMessage: true,
    failureFlash: true,
  })
);

//Facebook Oauth
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
  })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/setPassword",
    failureRedirect: "/register",
  })
);

//Logout
router.post("/logout", logoutUser);

//reset pwd
router.post("/reset", resetPost);
router.post("/resetName", resetNamePost);

//set Pwd
router.get("/setPassword", setPasswordView);

router.post("/setPassword", setPasswordPost);

//Resend email
router.get("/sendEmail", sendEmailView);
router.post("/sendEmail", sendMail);

//user profile
router.get("/userProfile", ensureAuthenticated, (req, res) => {
  res.render("userProfile.ejs", { user: req.user });
});

//reset Name
router.get("/resetName", ensureAuthenticated, (req, res) => {
  res.render("resetName.ejs", { user: req.user });
});

// userDashboard

router.get("/userDashboard", (req, res) => {
  res.render("userDashboard.ejs", {});
});

module.exports = router;
