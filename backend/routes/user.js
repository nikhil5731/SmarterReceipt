const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { User } = require('../db');

const router = express.Router();

router.get('/current_user', isAuthenticated, (req, res) => {
    res.send(req.user);
});

router.post('/addShopName', isAuthenticated, async (req, res) => {
    const { shopName } = req.body;

    try {
        const user = await User.findById(req.user.id);
        user.ShopName = shopName;
        await user.save();
        res.send(user);
    } catch (err) {
        res.status(500).send('Error saving shop name');
    }
});




module.exports = router;
