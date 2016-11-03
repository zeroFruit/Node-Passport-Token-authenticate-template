/*
  auth
*/
var auth      = require('../models/auth');
var respond   = require('../helpers/respond');
var express   = require('express');

module.exports.set = function(app, passport) {
  /*
    passportInit need app to initialize passport
  */
  //var passport = auth.passportInit(app);

  app.get('/', function(req, res, next) {
    res.render('login');
  });

  app.post('/auth', passport.authenticate(
    'local', {
      session: false,
      scope: []
    }), auth.serializeUser, auth.serializeClient,
    /* so far we authenticate new visitor, now if success auth, give them access/refresh token */

    /********************************************************************
      should fix

        1. everytime user login, there's new row in clients tables.
            should rid of that redundancy
        2. ...
    *********************************************************************/
    auth.generateAccessToken,
    // function(req, res, next) {
    //  maybe this callback can remove the redundancy
    // },
    auth.generateRefreshToken,
    /*
      respond to clients

        - accessToken
        - expires
        - refrehToken
        - user
    */
    respond.auth
  );
}
