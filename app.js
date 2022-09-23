const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const app = express();
require("./config/database");
require("dotenv").config();
require("./config/passport");
const passport = require('passport');
const session = require("express-session");
const MongoStore = require('connect-mongo');


const User = require("./models/user.model");
const bcrypt = require('bcrypt');
const Passport = require('passport');
const saltRounds = 10;

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: "sessions",

    }),
    // cookie: { secure: true }
}));

app.use(Passport.initialize());
app.use(Passport.session());


app.get("/", (req, res) => {
    res.render("index")
});


//register routes : get
app.get("/register", (req, res) => {
    res.render("register")
});


//register routes :POST

app.post("/register", async (req, res) => {
    try {

        const user = await User.findOne({ username: req.body.username });
        if (user) return res.status(400).send("User already exit");

        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
            const newUser = new User({
                username: req.body.username,
                password: hash
            });
            await newUser.save();
            res.redirect("/login");
        });


    } catch (error) {
        res.status(500).send(error.message);
    }
})


//login routes :GET
const checkLogin = (req, res,next) => {
   if(req.isAuthenticated()) {
    return res.redirect("/"); 
   }
   next();
}

app.get("/login", checkLogin ,(req, res) => {
   res.render("login");
})

//login routes :POST

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', successRedirect: "/" }),
)



//PROFI routes 
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };
  
  // profile protected route
  app.get("/profile", checkAuthenticated, (req, res) => {
    res.render("profile");
  });

//LOGOUT routes 
app.get("/logout", (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
})

module.exports = app;