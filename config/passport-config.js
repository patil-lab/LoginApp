const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

var db = require('../models/database')
const User = db.User
module.exports = function (passport) {
    passport.use(
        new LocalStrategy(
            { userNameField: 'email' },
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

    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user)
        })
    })
}
