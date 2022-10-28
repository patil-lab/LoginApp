//js
const express = require("express");
const {
  registerView,
  loginView,
  registerUser,
  verifyEmail,
  homePageView,
  dashboardView,
  loginUser,
} = require("../controller/loginController");
const router = express.Router();

router.get("/", homePageView);
router.get("/register", registerView);
router.get("/login", loginView);

router.post("/register", registerUser);
router.get("/verify", verifyEmail);
router.get("/dashboard", dashboardView);
router.post("/login", loginUser);
module.exports = router;
