"use strict";

const express = require("express");
const app = express();
const createUser = require("../service/loginService").createUser;
const verifyUser = require("../service/loginService").verifyUser;
const logoutUserPost = require("../service/loginService").logoutUserPost;
const resetPassword = require("../service/loginService").resetPassword;
const setPwdPost = require("../service/loginService").setPwdPost;
const resendEmail = require("../service/loginService").resendEmail;
const resetNamePostCall = require("../service/loginService").resetNamePostCall;

/**
 *
 * @param {*} req
 * @param {register page} res
 *
 * register page view
 */
const registerView = (req, res) => {
  res.render("register.ejs", {});
};
/**
 *
 * @param {*} req
 * @param {login page } res
 *
 * login page view
 */
const loginView = (req, res) => {
  res.render("login.ejs", {});
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * home page view
 */

const homePageView = (req, res) => {
  res.render("landing.ejs", {});
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * send email view
 */
const sendEmailView = (req, res) => {
  res.render("resendMail.ejs", { user: req.user });
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * reset pwd view
 */

const resetView = (req, res) => {
  res.render("reset.ejs", { user: req.user });
};
/**
 *
 * @param {*} req
 * @param {*} res
 *
 * reset password post
 */

const resetPost = async (req, res) => {
  await resetPassword(req, res);
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * register user post
 */

const registerUser = async (req, res) => {
  await createUser(req, res);
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * verify user email
 */

const verifyEmail = async (req, res) => {
  await verifyUser(req, res);
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * logout user
 */

const logoutUser = async (req, res) => {
  await logoutUserPost(req, res);
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * set Password
 */

const setPasswordView = (req, res) => {
  res.render("setPassword.ejs", { user: req.user });
};

const setPasswordPost = async (req, res) => {
  await setPwdPost(req, res);
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * send email
 */

const sendMail = async (req, res) => {
  await resendEmail(req, res);
};

/**
 *
 * @param {*} req
 * @param {*} res
 *
 * reset name
 */

const resetNamePost = async (req, res) => {
  await resetNamePostCall(req, res);
};

module.exports = {
  registerView,
  loginView,
  registerUser,
  verifyEmail,
  homePageView,
  logoutUser,
  resetView,
  resetPost,
  setPasswordView,
  setPasswordPost,
  sendMail,
  sendEmailView,
  resetNamePost,
};
