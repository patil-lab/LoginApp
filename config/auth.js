/**
 * secure pages
 */

module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        req.flash('message', 'Please log in to view that resource')
        res.redirect('/')
    },
    forwardAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/')
        }
        return next()
    },
}
