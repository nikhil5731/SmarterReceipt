const express = require('express');
const nodemailer = require('nodemailer');
const { User, Inventory } = require('../db');
const router = express.Router();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service
    auth: {
        user: 'aakarshkaushal911@gmail.com', // Your email address
        pass: 'yojz hxiq mwah ohud'   // Your email password or an app-specific password if using 2FA
    }
});

router.post('/send_link', async (req, res) => {
    const { email, link } = req.body;

    console.log('Received request to send link');
    console.log('Email:', email);
    console.log('Link:', link);

    const mailOptions = {
        from: 'smartereceipt2@gmail.com', // Sender address
        to: email, // List of recipients
        subject: 'Your Order is Ready!', // Subject line
        text: `Your order is ready! View it here: ${link}` // Plain text body
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Link sent successfully' });
    } catch (error) {
        console.error('Error sending link:', error);
        res.status(500).json({ success: false, message: 'Error sending link' });
    }
});

module.exports = router;
