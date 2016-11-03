/*
  Controller - index

    * About
      This module is hub of all controllers. Every controllers spown from here.
      To protect the route, feed passport.

*/
var _auth     = require('../models/auth');

/* 
  Controller module
*/
var auth      = require('./auth');
var home      = require('./home');


module.exports.set = function(app) {
  /*
    passportInit need app to initialize passport
  */
  var passport = _auth.passportInit(app);

  auth.set(app, passport);
  home.set(app, passport);
}
