const express = require("express");
const app = express();
const createUser = require("../service/loginService");
const verifyUser = require("../service/loginService");
const loginUserPost = require("../service/loginService");

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const registerView = (req, res) => {
  res.render("register.ejs", {});
};
// For View
const loginView = (req, res) => {
  res.render("login.ejs", {});
};

const homePageView = (req, res) => {
  res.render("landing.ejs", {});
};

const dashboardView = (req, res) => {
  res.render("dashboard.ejs", {});
};
const registerUser = async (req, res) => {
  await createUser(req, res);
};

const verifyEmail = async (req, res) => {
  await verifyUser(req, res);
};

const loginUser = async (req, res, next) => {
  await loginUserPost(req, res, next);
};

module.exports = {
  registerView,
  loginView,
  registerUser,
  verifyEmail,
  homePageView,
  dashboardView,
  loginUser,
};
