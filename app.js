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
const passportLocal = require('passport-local');
const passportLocalMongose = require('passport-local-mongoose');
const User = require('./mymodules/user');
const nnaji = require('./mymodules/middlewareandfunctions');
const DBurl = "mongodb+srv://jamin:jamin0n3@cluster0-ac1si.mongodb.net/test?retryWrites=true&w=majority";
const localdburl = "mongodb://localhost/benjamin"
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
    
    
    var post = req;
    nnaji.uploadfile(post);
   post.body.blog.body = req.sanitize(req.body.blog.body);
       blog.create(post.body.blog).then(() => {
            console.log("created new blog")
        }).catch((err) => {
            console.log("Error:" + err)
        });

    res.redirect("/blogs");
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
    var post = req;
    nnaji.uploadfile(post);
   post.body.blog.body = req.sanitize(req.body.blog.body);
   blog.findByIdAndUpdate(req.params.id,post.body.blog).then(() => {
    console.log("blog updated")
}).catch((err) => {
    console.log("Error:" + err)
    res.redirect("/blogs")
});
 res.redirect("/blogs/" + req.params.id);
})


// delete route 
app.delete('/blogs/:id',nnaji.allowAccess, (req, res) => {

nnaji.photocheck(req.body.oldimagepath)
blog.findByIdAndDelete(req.params.id).then(() => {
    console.log("post deleted");}).catch((err) => {
        console.log("Error:" + err)});

res.redirect("/blogs");

})




// starting up server
app.listen('3000', () => {
    console.log("server is connected");
});