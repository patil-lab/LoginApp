"use strict"

const express = require("express");
const app = express();
const createUser = require("../service/loginService").createUser;
const verifyUser = require("../service/loginService").verifyUser;
const loginUserPost = require("../service/loginService").loginUserPost;
const logoutUserPost = require("../service/loginService").logoutUserPost;
const {ensureAuthenticated,forwardAuthenticated}=require('../config/auth')


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

const homePageView =(forwardAuthenticated, (req, res) => {
  res.render("landing.ejs", {});
});

const dashboardView =( ensureAuthenticated,(req, res) => {
  res.render("dashboard.ejs", {user : req.user});
});
const registerUser = async (req, res) => {
  await createUser(req, res);
};

const verifyEmail = async (req, res) => {
  await verifyUser(req, res);
};

const loginUser = async (req, res) => {
  await loginUserPost(req, res);
};

const logoutUser=async(req,res)=>{
  await logoutUserPost(req,res)
}

module.exports = {
  registerView,
  loginView,
  registerUser,
  verifyEmail,
  homePageView,
  dashboardView,
  loginUser,
  logoutUser
  
};
