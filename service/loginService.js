"use strict"

const bcrypt = require("bcryptjs");
var db = require("../models/index");
const User = db.Person;
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const passport = require('passport');
require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

          
          const myUrl = new URL(process.env.BASE_URL);
          
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
    }else{
    user.token = null;
    user.isVerified = true;
    const newUser=await user.save();
    req.login(newUser, (err) => {
      if (err) {
        // Session save went bad
        return next(err);
      }
      // All good, we are now logged in and `req.user` is now set
      res.redirect('/dashboard')
    })};
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

// async function loginUserPost(req, res, next) {
//   passport.authenticate("local", {
//     successRedirect: "/dashboard",
//     failureRedirect:'/login',
//     failureFlash: true
    
//   })(req,res,next);
// };



async function loginUserPost(req, res, next) {
  passport.authenticate('local' ,function(err, user, info) {
    console.log('Inside passport.authenticate() callback');
    console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
    console.log(`req.user: ${JSON.stringify(req.user)}`)
    if (err) { return next(err); }
    if (!user) { return res.send("-1"); }
    //req.login calls passport.serialize user
    //req.user = user;// remove if unwanted
    req.login(user, function(err) {
      //req.session.save // remove if unwanted
      console.log('Inside req.login() callback')
      console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
      console.log(`req.user: ${JSON.stringify(req.user)}`)
      if (err) { return next(err); }
      return res.redirect('/dashboard')
    });
  })(req, res, next);
};


  // async function loginUserPost(req, res, next) {
  //   passport.authenticate("local", async function(err, user, info) {
  //     if (err) { return next(err); }
  //     if (!user) {
  //       req.flash(
  //         "message",
  //         "Login unsuccessfull"
  //       );
  //       return res.render('/');
  //     }
  
  //     req.login(user, function(err) {
  //       if (err) return next(err); 
  //       return res.redirect('/dashboard');
  //     });
  
  //   })(req,res,next);
  // };
  


async function logoutUserPost(req,res,next){
  console.log(req.session)
  req.logOut()
  req.session.destroy((err) => res.redirect('/'));
}

 function createNewUser(profile,registrationType){

  return  User.create({
  
      socialUserId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      registrationType: registrationType,
      email:profile.emails[0].value
    
  });
  
}


async function getUserByEmail(email){
  return User.findOne({email})
}

async function resetPassword(req,res){
  const{oldPwd,newPwd,rPwd}=req.body
  const email=req.user.email
  User.findOne({
    where: { email: email },
  }).then((user)=>{

    if(user){
      if(user.password==null){
        req.flash(
          "message",
          "You dont have password set. Please set new password!"
        );
        res.redirect('/dashboard')
      }
      bcrypt.compare(oldPwd, user.password, (err, isMatch) => {
        if (err) throw err
        if (isMatch) {
          if(newPwd!=rPwd){
            req.flash(
              "message",
              "New Passwords must match to proceed"
            );
            res.redirect("/reset");
            
    
          }else{
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
                .then(()=>{
                  req.flash(
                    "message",
                    "Password reset successfull!"
                  );
                  res.redirect('/dashboard')
                })
                .catch((err) => console.log(err));
            })
          );

          }
            
        } else {
          req.flash(
            "message",
            "Old Password is incorrect"
          );
          res.redirect("/reset");
          
        }
    })
    
    }
  })
}

          async function setPwdPost(req,res){
          const {newPwd}=req.body
          const email=req.user.email
          User.findOne({
            where: { email: email },
          }).then((user)=>{
            if(user){
              if(user.password!=null){
                req.flash(
                  "message",
                  "You have a password set .Please reset if you wish to!"
                );
                res.redirect('/dashboard')
              }else{
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
            .then(()=>{
              req.flash(
                "message",
                "Password set successfully!"
              );
              res.redirect('/dashboard')
            })
            .catch((err) => console.log(err));
        })
      );

              }
            }
          })

               
  

}



module.exports={createUser,verifyUser,loginUserPost,logoutUserPost,createNewUser,getUserByEmail,resetPassword,setPwdPost}