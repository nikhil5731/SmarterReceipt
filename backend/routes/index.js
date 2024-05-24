const express = require('express');
const userRouter = require('./user');
const inventoryRouter = require('./inventory');
const authRouter = require('./auth');

const router = express.Router();

router.use('/user', userRouter);
router.use('/inventory', inventoryRouter);
router.use('/auth', authRouter); // Register auth routes

module.exports = router;
