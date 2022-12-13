const mongoose = require ('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const passport = require('passport');
const passportLocal = require('passport-local');
const expressSession = require("express-session");
const express = require("express");
const app = express();
var blog = require("./blogsetup.js");
const cloudinary = require('cloudinary');
var nodemailer = require("./nodemailersetup.js");



var ben = {
    
islogged: function (req) {
    
    if (req.isAuthenticated()) {
          
      return req.user.username;
    }else {return null;}
},

allowAccess: function (req, res, next) {

    if (req.isAuthenticated()) {


        return next()
    }
    res.redirect('./')

},
photodelete:function (request){
    if (request != '') {
        blog.findById(request.params.id).then((result) => {

        cloudinary.v2.uploader.destroy(result.imageId, function(err){
            console.log(err)
        })
})
    }
},
sendmail: function (params) {
       
    let info = transporter.sendMail({
         from: '"jamin 👻" <nnajibenjamin33@gmail.com>', // sender address
         to: 'bennnaji33@gmail.com', // list of receivers
         subject: 'computer repair appointment', // Subject line
         text: params, // plain text body
         
          // html body
     });
 
     console.log('Message sent: %s', info.messageId);
     // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
 
     // Preview only available when sending through an Ethereal account
     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
     // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
 
 }
 
}
module.exports = ben;