var express = require('express');
var passport = require('passport');
var Strategy = require('passport-oauth1-userinfo').Strategy;


passport.use(new Strategy({
    userAuthorizationURL: 'http://127.0.0.1:3001/oauth/authorize',
    requestTokenURL: 'http://127.0.0.1:8080/initiate',
    accessTokenURL: 'http://127.0.0.1:8080/token',
    userProfileURL: 'http://127.0.0.1:8081/userinfo',
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: 'http://localhost:3000/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }));


passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/oauth',
  passport.authenticate('oauth'));

app.get('/return', 
  passport.authenticate('oauth', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.listen(3000);
