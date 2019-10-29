//varible declaration and required module imports
const express = require("express");
const expressSession = require("express-session");
const BodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressSanitizer = require("express-sanitizer");
const fs = require("fs");
const app = express();
const multer = require('multer');
var upload  = require('./mymodules/multersetup');
const methodOverride = require("method-override");
const path = require('path');
var blog = require("./mymodules/blogsetup")
const passport = require('passport');
require('dotenv').config();
const cloudinary = require('cloudinary');
const passportLocal = require('passport-local');
const passportLocalMongose = require('passport-local-mongoose');
const User = require('./mymodules/user');
const nnaji = require('./mymodules/middlewareandfunctions');
const DBurl = "mongodb+srv://jamin:"+process.env.MON_PASSWORD+"@cluster0-ac1si.mongodb.net/test?retryWrites=true&w=majority";
var show = false;

//server settup
app.set("view engine", "ejs");
app.use(expressSession({
    secret: 'who said love is not a beautiful thing',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static("public"));
app.use(BodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());


// Database setup
mongoose.connect(DBurl, { useNewUrlParser: true }).then(() => {
    console.log("DB is connected")
}).catch((err) => {
    console.log("DB lost connection:" + err)
});
mongoose.set('useFindAndModify', false);


//passport configuration
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

cloudinary.config({
cloud_name:"dpcrw2zwq",
api_key:558168194918281,
api_secret:"2V1_6EOIJtMT4hytDtMJAitBpiU"
})


//Routes using RESTFUL syntax 

//index route
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {

    show= nnaji.islogged(req);

    blog.find({}).then((result) => {
        result = result.reverse();
   
        res.render("index", { Allblogs: result, search: 1, newpost: show });
    }).catch((err) => {
        console.log("Error:" + err);
    });

});



//signup routes
app.get("/signup", (req, res) => {
    show = nnaji.islogged(req);
    
    if(show === false){
     res.render('signup');
}else res.redirect("/")
   
})

app.post("/signup", (req, res) => {
    

    User.register(new User({ username: req.body.username }), req.body.password, (err, User) => {
        if (err) {
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect('/blogs')
        })
    })

});


//login routes
app.get("/login",(req, res) => {
show = nnaji.islogged(req);
    
    if(show === false){
    res.render('login');
}else res.redirect("/")

    
})
app.post("/login", passport.authenticate('local', {
    successRedirect: "/blogs/new",
    failureRedirect: "/blogs",
}), (req, res) => {

})

// logout route
app.get("/logout",(req,res)=>{
   
    req.logOut();
    res.redirect("/");

})


//new route 
app.get("/blogs/new", nnaji.allowAccess,(req, res) => {
    show = nnaji.islogged(req);
    res.render("newpostform", { search: 0, newpost: show });

});

//create route
app.post("/blogs",nnaji.allowAccess, upload.single('ben'), (req, res) => {
     if(req.file){
    cloudinary.v2.uploader.upload(req.file.path, function (err,result) {
             var post = req;
        post.body.blog.image = result.secure_url;
        post.body.blog.imageId= result.public_id; 
    post.body.blog.imagefilename = req.file.originalname;
    post.body.blog.body = req.sanitize(req.body.blog.body);

    blog.create(post.body.blog).then(() => {
        console.log("created new blog")
        
    }).catch((err) => {
        console.log("Error:" + err)
    });
     return res.redirect("/");
});
} else {
    var post = req; 
post.body.blog.body = req.sanitize(req.body.blog.body);

blog.create(post.body.blog).then(() => {
    console.log("created new blog")
    
}).catch((err) => {
    console.log("Error:" + err)
});
res.redirect("/");
}
    
})

// show route

app.get("/blogs/:id", (req, res) => {
   

    var postid = req.params.id;
    blog.findById(postid).then((result) => {

        res.render("showpost", { res: result, search: 0, newpost: show });
    }).catch((err) => {
        console.log("Error:" + err)
        res.redirect("/blogs");
    });

});


// edit route

app.get("/blogs/:id/edit",nnaji.allowAccess, (req, res) => {
    
    blog.findById(req.params.id).then((result) => {

        res.render('editpost', {res: result, search: 0, newpost:show })
    }).catch((err) => {
        console.log("Error:" + err)
        res.redirect("/blogs");
    });

});

// update route
app.put("/blogs/:id",nnaji.allowAccess, upload.single('ben'), (req, res) => {
    if(req.file){

     nnaji.photodelete(req); 
        cloudinary.v2.uploader.upload(req.file.path, function (err,result) {
                 var post = req;
            post.body.blog.image = result.secure_url;
            post.body.blog.imageId= result.public_id; 
        post.body.blog.imagefilename = req.file.originalname;
        post.body.blog.body = req.sanitize(req.body.blog.body);
    
        blog.findByIdAndUpdate(req.params.id,post.body.blog).then(() => {
            console.log("blog updated")
        }).catch((err) => {
            console.log("Error:" + err)
            res.redirect("/blogs")
        });
        return res.redirect("/blogs/" + req.params.id);
    });
    } else {
        var post = req; 
    post.body.blog.body = req.sanitize(req.body.blog.body);
    blog.findByIdAndUpdate(req.params.id,post.body.blog).then(() => {
        console.log("blog updated")
    }).catch((err) => {
        console.log("Error:" + err)
        res.redirect("/blogs")
    });
     res.redirect("/blogs/" + req.params.id);
    }
 
})


// delete route 
app.delete('/blogs/:id',nnaji.allowAccess, (req, res) => {

 nnaji.photodelete(req);
blog.findByIdAndDelete(req.params.id).then(() => {
    console.log("post deleted");}).catch((err) => {
        console.log("Error:" + err)});

res.redirect("/blogs");

})




// starting up server
app.listen(process.env.PORT, () => {
    console.log("server is connected");
});