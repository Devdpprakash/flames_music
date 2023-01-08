require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { setTheUsername } = require("whatwg-url");
var session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const e = require('express');

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/musicDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
 });
 
 userSchema.plugin(passportLocalMongoose);
 
 
 const User = new mongoose.model("User", userSchema);
 
 passport.use(User.createStrategy());
 
//  passport.serializeUser(User.serializeUser());
//  passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  

app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});


app.get("/register", function(req,res){
    res.render("register");
});

app.get("/music", function(req, res){
    if(req.isAuthenticated()){
        res.render("music");
    }else{
        res.redirect("/login");
    }
});

app.post('/register', function(req,res){
    User.register({username: req.body.username, first_name: req.body.firstName, last_name: req.body.lastName}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
           passport.authenticate("local")(req, res, function(){
            res.redirect("/music");
           });
        }
    });
});



app.post('/login', function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/music");
               });
        }
    })
});



app.listen(3000, function(req,res){
    console.log("Server started on port 3000");
});