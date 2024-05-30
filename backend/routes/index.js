const express = require('express');
const userRouter = require('./user');
const inventoryRouter = require('./inventory');
const authRouter = require('./auth');
const sendLinkRouter = require('./sendLink');

const router = express.Router();

router.use('/user', userRouter);
router.use('/inventory', inventoryRouter);
router.use('/auth', authRouter);
router.use('/send_link', sendLinkRouter);

module.exports = router;
