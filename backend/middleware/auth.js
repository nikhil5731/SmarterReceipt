function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('https://smartereceipt.netlify.app');
}

module.exports = { isAuthenticated };
