module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            console.log(req.session+"is authenticated")
            return next();
        }
        console.log(req.session+"not authenticated")
        req.flash('message', 'Please log in to view that resource');
        res.redirect('/');
    },
    forwardAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/dashboard')
          }
          next() 
    }
};