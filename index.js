// EXPRESS SETUP

const expess = require("express");
const app = expess();

app.use(expess.static(__dirname));

const expressSession = require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false
});

app.use(expess.json());
app.use(expess.urlencoded({ extended: true }));
app.use(expressSession);

const port = 3000 || process.env.PORT;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

// PASSPORT SETUP

const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());

// MONGOOSE SETUP

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/MyDatabase", { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model("userInfo", UserDetail, "userInfo");

// PASSPORT LOCAL AUTHENTICATION

passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

// ROUTES


const connectEnsureLogin = require("connect-ensure-login");

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err){
            return next(err);
        }

        if (!user){
            return res.redirect("/login?info=" + info);
        }

        req.login(user, function(err){
            if (err){
                return next(err);
            }

            return res.redirect("/");
        });
    })(req, res, next);
});

app.get("/login", (req, res) => {
    res.sendFile("html/login.html", { root: __dirname});
});

app.get("/", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
   res.sendFile("html/index.html", { root: __dirname}); 
});

app.get("/private", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.sendFile("html/private.html", { root: __dirname});
});

app.get("/user", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.send({ user: req.user });
});

/* REGISTER SOME USERS */

// UserDetails.register({username:'paul', active: false}, 'paul');
// UserDetails.register({username:'jay', active: false}, 'jay');
// UserDetails.register({username:'roy', active: false}, 'roy');