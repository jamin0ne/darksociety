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
const DBurl = "mongodb+srv://jamin1:"+process.env.MON_PASSWORD+"@cluster0.qthmu.mongodb.net/?retryWrites=true&w=majority";
var show = null ;

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
mongoose.connect(DBurl,{useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
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
api_key:process.env.APIKEY,
api_secret:process.env.APISECERT
})


//Routes using RESTFUL syntax 

//index route
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {

    show = nnaji.islogged(req);

    blog.find({}).then((result) => {
        result = result.reverse();
   
        res.render("index", { Allblogs: result, search: 1, newpost: show });
    }).catch((err) => {
        console.log("Error:" + err);
    });

});

// search route

app.get("/blogs/search", (req, res) => {

    show = nnaji.islogged(req);
    console.log(req.query.search);
    var searchKey= req.query.search;
    blog.find({"title":searchKey && { $regex:searchKey.slice(0,1)}}).then((result) => {
        result = result.reverse();
   
        res.render("index", { Allblogs: result, search: 1, newpost: show, msg:"search results" });
    }).catch((err) => {
        console.log("Error:" + err);
    });

});



//signup routes

app.post("/signup", (req, res) => {
    User.findOne({email:req.body.email}).then((result)=>{
      if(result.email !== null || undefined){
        return res.render("login",{search: 0, newpost:show, msg:"email already exist" });
          }
        }).catch((err)=>{
    User.register(new User({ username: req.body.username, email:req.body.email }), req.body.password, (err, User) => {
        if (err) {
            console.log(err);
            return res.render("login",{search: 0, newpost:show, msg: err.message });
        }
        passport.authenticate("local")(req, res, () => {
                    res.redirect("/blogs")
        })
    })
})

});


//login routes
app.get("/login",(req, res) => {
show = nnaji.islogged(req);
    console.log(show)
    if(show === null){
    res.render('login', {search: 0, newpost:show });
}else res.redirect("/")

    
})
app.post("/login", passport.authenticate('local', {
    successRedirect: "/blogs",
    failureRedirect: "/blogs",
}), (req, res) => {

})

// logout route
app.get("/logout",(req,res)=>{
   var curUserUrl= req.headers.referer;
    req.logOut();
    res.redirect(curUserUrl);

})


//new route 
app.get("/blogs/new", nnaji.allowAccess,(req, res) => {
   
    console.log("new route: "+req.user.username)
    show = nnaji.islogged(req);
    res.render("newpostform", { search: 0, newpost: show });

});

//create route
app.post("/blogs",nnaji.allowAccess, upload.single('ben'), (req, res) => {
    console.log("new blog created: "+req.user.username);
    //check if picture is uploaded
     if(req.file){
    cloudinary.v2.uploader.upload(req.file.path, function (err,result) {
             var post = req;
        post.body.blog.image = result.secure_url;
        post.body.blog.imageId= result.public_id; 
        post.body.blog.author = req.user.username;
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
    post.body.blog.author = req.user.username;
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
    //checks if new picture is uploaded
    if(req.file){

        //deletes old picture form cloudianry
     nnaji.photodelete(req); 
     //upload new picture to cloudinary and return link path
        cloudinary.v2.uploader.upload(req.file.path, function (err,result) {
                 var post = req;
            post.body.blog.image = result.secure_url;
            post.body.blog.imageId= result.public_id; 
        post.body.blog.imagefilename = req.file.originalname;
        post.body.blog.body = req.sanitize(req.body.blog.body);
    //updating post with new info
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

//About route
app.get("/about",(req, res) => {
    show = nnaji.islogged(req);
    res.render("about", { search: 0, newpost: show });

});


//Livechat route
app.get("/discussion",(req, res) => {
    show = nnaji.islogged(req);
    res.render("livechat", { search: 0, newpost: show });

});

app.get("/discussion",(req, res) => {
    show = nnaji.islogged(req);
    res.render("livechat", { search: 0, newpost: show });

});






app.get("/*",(req, res) => {
   
   res.redirect("/blogs");
});

// starting up server
app.listen(process.env.PORT, () => {
    console.log("server is connected");
});