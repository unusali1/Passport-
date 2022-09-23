const User = require("../models/user.model");
const Passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

Passport.use(new LocalStrategy(
    async (username, password, done) => {

        try {
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: "User not found" });
            }
            if (!bcrypt.compare(password, user.password)) {
                return done(null, false, { message: "Incorrect password" });
            }

            return done(null, user);
        } catch (error) {
            return done(err);
        }
    }));

// create session id
// whenever we login it creares user id inside session
Passport.serializeUser((user, done) => {
    done(null, user.id);
});

// find session info using session id
Passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});