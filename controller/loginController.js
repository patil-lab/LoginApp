"use strict"

const express = require("express");
const app = express();
const createUser = require("../service/loginService").createUser;
const verifyUser = require("../service/loginService").verifyUser;
const loginUserPost = require("../service/loginService").loginUserPost;
const logoutUserPost = require("../service/loginService").logoutUserPost;
const resetPassword=require('../service/loginService').resetPassword
const setPwdPost=require('../service/loginService').setPwdPost


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const registerView = (req, res) => {
  res.render("register.ejs", {});
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const loginView = (req, res) => {
  res.render("login.ejs", {});
};

const homePageView = (req, res) => {
  res.render("landing.ejs", {});
};

const resetView=(req,res)=>{
  res.render("reset.ejs",{user : req.user})
}
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

const resetPost=async(req,res)=>{
  await resetPassword(req,res)
}

const setPasswordView=(req,res)=>{
  res.render("setPassword.ejs",{user : req.user})
}

const setPasswordPost=async (req,res)=>{
  await setPwdPost(req,res)
}

module.exports = {
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
};
