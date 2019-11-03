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
const User = require('./user.js');

var ben = {
    
islogged: function (req) {
    var access = false;
    var admin =false;
    if (req.isAuthenticated()) {
        User.findOne(req.body.username).then((result)=>{
            console.log(result)
        if (result.username === "jamin0ne"){
            admin =true
            access=true
            return [access,admin]
    }else {
        admin = false
            access=true
            return [access,admin]
    }
})
}else {return [access,admin]}

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