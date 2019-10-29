const mongoose = require("mongoose");
// DB configuration
var BlogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    imageId: String,
    imagefilename: String,
    created: { type: Date, default: Date.now }//this is used to get the date stamp without making user type it
});



module.exports = mongoose.model("blog", BlogSchema);
