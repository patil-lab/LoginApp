require('dotenv').config()
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL
const FacebookStrategy = require('passport-facebook').Strategy
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL
const createNewUser = require('../service/loginService').createNewUser

var db = require('../models/index')
const { getUserByEmail } = require('../service/loginService')
const User = db.Person
/**
 *
 * @param {*} passport
 * passport strategy for local,google and facebook logins
 */
const loginCheck = (passport) => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email', // define the parameter in req.body that passport can use as username and password
                passwordField: 'password',
            },
            (email, password, done) => {
                User.findOne({ where: { email: email } }).then((user) => {
                    if (!user) {
                        return done(null, false, {
                            message: 'The email is not registered',
                        })
                    }
                    if (user.password != null) {
                        bcrypt.compare(
                            password,
                            user.password,
                            (err, isMatch) => {
                                if (err) throw err
                                if (isMatch) {
                                    user.loggedIn += 1
                                    user.lastSession = Date.now()
                                    user.save()
                                    return done(null, user)
                                } else {
                                    return done(null, false, {
                                        message:
                                            'Password entered is incorrect',
                                    })
                                }
                            }
                        )
                    } else if (
                        (user.registrationType == 'google' ||
                            user.registrationType == 'facebook') &&
                        user.password == null
                    ) {
                        return done(null, false, {
                            message:
                                'Please sign up again and set password to proceed',
                        })
                    }
                })
            }
        )
    )

    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: GOOGLE_CALLBACK_URL,
            },
            async function (accessToken, refreshToken, profile, done) {
                var google = 'google'
                const currUser = await getUserByEmail(profile.emails[0].value)
                if (!currUser) {
                    const user = await createNewUser(profile, google)
                    return done(null, user)
                }
                if (currUser.registrationType != google) {
                    return done(null, false, {
                        message:
                            'You have previously signed up with a different signin method ',
                    })
                }

                currUser.loggedIn += 1
                currUser.lastSession = Date.now()
                currUser.save()
                return done(null, currUser)
            }
        )
    )

    passport.use(
        new FacebookStrategy(
            {
                clientID: FACEBOOK_CLIENT_ID,
                clientSecret: FACEBOOK_CLIENT_SECRET,
                callbackURL: FACEBOOK_CALLBACK_URL,
                profileFields: ['id', 'emails', 'name'],
            },
            async function (accessToken, refreshToken, profile, done) {
                var facebook = 'facebook'
                const currUser = await getUserByEmail(profile.emails[0].value)
                if (!currUser) {
                    const user = await createNewUser(profile, facebook)
                    return done(null, user)
                }
                if (currUser.registrationType != facebook) {
                    return done(null, false, {
                        message:
                            'You have previously signed up with a different signin method ',
                    })
                }
                currUser.loggedIn += 1
                currUser.lastSession = Date.now()
                currUser.save()
                return done(null, currUser)
            }
        )
    )

    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(async function (id, done) {
        const user = await User.findByPk(id)
        return done(null, user)
    })
}

module.exports = {
    loginCheck,
}
