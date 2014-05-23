var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , ForceDotComStrategy  = require('passport-forcedotcom').Strategy;
  
passport.use(new ForceDotComStrategy({
    clientID: '{clientID}',
    clientSecret: '{clientSecret}',
    callbackURL: '{callbackUrl}'
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile);
    return done(null, profile);
  }
));

var app = express.createServer();

app.get('/login', passport.authenticate('forcedotcom'));
app.get('/token', 
  passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
  function(req, res){
//    res.render("index",checkSession(req));
    console.log(req);
  });