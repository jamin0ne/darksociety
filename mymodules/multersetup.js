const multer = require('multer');
const path = require('path');

// setting-up multer for image uploads
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
var filter = function (req,file,cb) {
    if(!file.originalname.match(/\.(jpg|jepg|png|gif)$/i)){
return cb(new Error('only image file are allowed'),false);

    }
    cb(null,true);
}

module.exports= multer({ storage: storage, fileFilter: filter })