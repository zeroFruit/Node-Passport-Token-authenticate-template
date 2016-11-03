/*
  home

    * Protected page (common property except 'auth')
      If you are admin, you can reach here.
      To ensure that only admin can access this page, will include jwtauth.
      This module protect the route; checking token and auth with db

    * About
      This is domain page.

*/
var jwtauth     = require('../middlewares/jwtauth');
var requireAuth = require('../middlewares/requireAuth');
var auth        = require('../models/auth');
var respond     = require('../helpers/respond');
var express     = require('express');


module.exports.set = function(app, passport) {
  /*
    passportInit need app to initialize passport
  */
  //var passport = auth.passportInit(app);

  app.get('/home', jwtauth, requireAuth, function(req, res, next) {
    res.send('come back home!');
  });
}
