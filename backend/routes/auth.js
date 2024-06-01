const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/inventory' }), (req, res) => {
    res.redirect('https://smartereceipt.netlify.app');
});

router.get('/logout', (req, res) => {
    req.session = null;
    res.send({ success: true });
});

module.exports = router;
