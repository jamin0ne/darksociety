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
photodelete:function (request){
    if (request != '') {
        blog.findById(request.params.id).then((result) => {

        cloudinary.v2.uploader.destroy(result.imageId, function(err){
            console.log(err)
        })
})
    }
},
 
}
module.exports = ben;