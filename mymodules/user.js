const mongoose = require ('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');



var userSchema = new mongoose.Schema({
               username: { type: String, required: true } ,
               email: { type: String, required: true },

               Password:{ type: String } 
            })

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);