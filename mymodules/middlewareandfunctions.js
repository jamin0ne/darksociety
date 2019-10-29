const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const passport = require('passport');
const passportLocal = require('passport-local');
const expressSession = require("express-session");
const express = require("express");
const app = express();
const cloudinary = require('cloudinary').v2;

var show = 0;


var ben = {

    islogged: function (req) {
        var access = false;
        if (req.isAuthenticated()) {
            access = true
            return access
        } else return access
    },
    allowAccess: function (req, res, next) {
        if (req.isAuthenticated()) {


            return next()
        }
        res.redirect('./')

    },
    photocheck: function (request) {
        if (request != '') {

            var filePath = 'public' + request
            fs.unlink(filePath, function (err) {
                console.log("Error:" + err)


            })
        }
    },
    uploadfile: function (request) {
        if (request.file) {
              
         cloudinary.uploader.upload(request.file.path, function (result) {
                var post = request;
                post.body.blog.image = result.secure_url;
                post.body.blog.imageId= result.public_id; 
            post.body.blog.imagefilename = request.file.originalname;
            post.body.blog.body = req.sanitize(request.body.blog.body);
            blog.create(post.body.blog).then(() => {
                console.log("created new blog")
            }).catch((err) => {
                console.log("Error:" + err)
            });
            });
        }
            
    
    }
}
module.exports = ben;