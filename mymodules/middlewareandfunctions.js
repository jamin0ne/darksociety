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
var show = 0;


var ben = {
    
islogged: function (req) {
    var access = false;
    if (req.isAuthenticated()) {
          access =true
      return access 
    }else return access
},
allowAccess: function (req, res, next) {
    if (req.isAuthenticated()) {


        return next()
    }
    res.redirect('./')

},
photocheck:function (request){
    if (request != '') {
        var filePath = 'public' + request
        fs.unlink(filePath, function (err) {
                console.log("Error:" + err)
           
        
        })
}
},
 uploadfile: function (request) {
    if (request.file) {
       
        ben.photocheck(request.body.oldimagepath);
        var post = request;
        post.body.blog.image = "/uploads/" + request.file.filename;
    post.body.blog.imagefilename = request.file.originalname;
    return post;
    }
}
}
module.exports = ben;