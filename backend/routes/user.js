const express = require('express');
const { User } = require('../db');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/current_user', isAuthenticated, (req, res) => {
    console.log('Sending current user:', req.user);
    res.send(req.user);
});

router.post('/addShopName', isAuthenticated, async (req, res) => {
    const { shopName, upiId } = req.body;

    try {
        const user = await User.findById(req.user.id);
        user.ShopName = shopName;
        user.upiId = upiId;
        await user.save();
        res.send(user);
    } catch (err) {
        res.status(500).send('Error saving shop name');
    }
});
router.put("/update", isAuthenticated, async (req, res) => {
    const {OwnerFirstName,OwnerLastName,ShopName} = req.body;
    try{
        const user = await User.findById(req.user.id);
        user.OwnerFirstName = OwnerFirstName;
        user.OwnerLastName = OwnerLastName;
        user.ShopName = ShopName;
        await user.save();
        res.send(user);
    }catch(err){
        res.status(500).send('Error updating user');
    }
})
module.exports = router;
