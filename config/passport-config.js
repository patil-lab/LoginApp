require('dotenv').config()
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_CALLBACK_URL=process.env.GOOGLE_CALLBACK_URL
const FacebookStrategy = require('passport-facebook').Strategy;
const FACEBOOK_CLIENT_ID=process.env.FACEBOOK_CLIENT_ID
const FACEBOOK_CLIENT_SECRET=process.env.FACEBOOK_CLIENT_SECRET
const FACEBOOK_CALLBACK_URL=process.env.FACEBOOK_CALLBACK_URL

var db = require('../models/database')
const User = db.User
const loginCheck =  (passport) => {
    passport.use(
        new LocalStrategy(
            { usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
            passwordField: 'password'},
            (email, password, done) => {
                User.findOne({ where: { email: email } }).then((user) => {
                    if (!user) {
                        return done(null, false, {
                            message: 'The email is not registered',
                        })
                    }
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err
                        if (isMatch) {
                            return done(null, user)
                        } else {
                            return done(null, false, {
                                message: 'Password entered is incorrect',
                            })
                        }
                    })
                })
            }
        )
    )


passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    userProfile=profile;
    return done(null, userProfile);
}
));

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: FACEBOOK_CALLBACK_URL
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

    passport.serializeUser(function (user, done) {
        console.log(`\n--------> Serialize User:`)
        console.log(user)
        done(null, user)
    })


    // passport.deserializeUser(async function(id, done) {
    //     const user= await User.findByPk(id);
    //     return done(null, user);
    //   });

    //   passport.deserializeUser((id, done) => {
    //     console.log(`\n--------> DeSerialize User:`)
    //     User.findByPk(id, (err, user) => {
    //         done(err, user);
    //     });
    // });

    // passport.serializeUser(function(user, cb) {
    //     cb(null, user);
    //   });
      
      passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
      });
}

module.exports = {
    loginCheck,
  };