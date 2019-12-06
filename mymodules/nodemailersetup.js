const xoauth2 = require("xoauth2");
const nodemailer = require('nodemailer');
const bodyParser = require("body-parser");


let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        
        type: 'OAuth2',
        user: process.env.SENDER_EMAIL,
        clientId:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECERET,
    refreshToken:process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN

    }
});

module.exports = transporter;