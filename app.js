//jshint esversion:8
require("dotenv").config();

const express = require("express");
const port = 3000;
const sequelize = require("./util/database");
const flash = require("express-flash");
const session = require("express-session");
const User = require("./models/user");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

// syncing to the database to create all the models defined
sequelize.sync().then(()=>{
    console.log("Successfully connected to database");
}).catch((err)=>{ console.log(err); });

app.get("/", (req, res)=>{
    if (req.session.loggedIn) {
        res.render("index");    
    } else {
        res.redirect("/login");
    }
    
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/signup", (req, res)=>{
    res.render("signup");
});

app.post("/signup", (req, res)=>{
    if (req.body.email === "") {
        req.flash("error", "Please enter a email.");
        return res.redirect("/signup");
    } 
    
    if (req.body.password === ""){
        req.flash("error", "Please enter a password");
        return res.redirect("/signup");
    }
    
    User.findOne( {where: { email: req.body.email }} ).then(user=>{
        if (user){ 
            req.flash("error", "Email already registered. Login Instead");
            res.redirect("/login");
        } else{
            bcrypt.hash(req.body.password, 10, async (err, hash) => {
                const newUser = await User.create({email: req.body.email, password: hash});
                req.session.loggedIn = true;
                res.render("index", {user: newUser.email});
            });
        }
    }).catch(err => { console.log(err); });

});

app.post("/login", (req, res)=>{
    if (req.body.email === "") {
        req.flash("error", "Please enter a email.");
        return res.redirect("/login");
    } 
    
    if (req.body.password === ""){
        req.flash("error", "Please enter a password");
        return res.redirect("/login");
    }
    
    User.findOne( {where: { email: req.body.email }} ).then(user=>{
        if (!user){ 
            req.flash("error", "User with that email does not exist. Signup Instead");
            res.redirect("/signup");
        } else{
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if(result){
                    req.session.loggedIn = true;
                    res.render("index", {user: user.email});
                }else{
                    req.flash("error", "Incorrect password");
                    res.redirect("/login");
                }
            });
        }
    }).catch(err => { console.log(err); });

});

app.get("/logout", (req, res)=>{
    req.session.destroy(err => {});
    res.redirect("/");
});

app.listen(port, ()=>{
    console.log("Server running on port "+port);
});