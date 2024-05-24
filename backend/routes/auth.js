const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('http://localhost:3000'); // Adjust redirect as necessary
});

router.get('/logout', (req, res) => {
    req.session = null;
    res.send({ success: true });
});

module.exports = router;
