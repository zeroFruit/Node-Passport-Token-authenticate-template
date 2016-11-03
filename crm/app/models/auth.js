/*
  Configuration
*/
const config    = require('../helpers/config');
const JWT_TOKEN_SECRET = config.jwtTokenSecret;
/*
  Modules
*/
const db        = require('../helpers/db');
const passport  = require('passport');
const Strategy  = require('passport-local');
const jwt       = require('jwt-simple');
const crypto    = require('crypto');
const moment    = require('moment');

module.exports = {
  /*
    passport initialize
  */
  passportInit: function(app) {
    app.use(passport.initialize());
    /*
      passport local strategy
    */
    passport.use(new Strategy(
      function(username, password, done) {
        db.user.authenticate(username, password, done);
      }
    ));

    return passport;
  },

  /*
    serializeUser
  */
  serializeUser: function(req, res, next) {
    db.user.updateOrCreate(req.user, function(err, user) {
      if(err)
        return next(err);
      /*
        we can store the updated information in req.user
        or contains just necessary information. if you need modify this.

        req.user = { ... };
      */
      next(); // this is necessary for going back to next cb
    });
  },

  /*
    serializeClient
  */
  serializeClient: function(req, res, next) {
    //console.log('this is in the auth model: '+ req.user);
    db.client.updateOrCreate({ user: req.user }, function(err, client) {
      if(err)
        return next(err);
      /*
        If needed, we store information in req.user

        req.user.clientid = client.id;
      */
      next();
    });
  },

  /*
    validateRefreshToken
  */
  validateRefreshToken: function(req, res, next) {
    /* db.client.findUserOfToken(req.body, function(err, user) {
        if(err)
          return next(err);
        // in this case, we found the user in db correspond to refreshtoken
        req.user = dbuser; // add to header that user
        next();
      })*/
    db.client.findUserOfToken(req.token, function(err, user) {
      if(err)
        return next(err);
      req.user = user;
      next();
    });
  },

  /*
    rejectToken
  */
  rejectToken: function(req, res, next) {
    /* db.client.rejectToken(req.body, next)
      // remove corresponding token from db
    */
    db.client.rejectToken(req.body, next);
  },

  /*
    generateAccessToken
  */
  generateAccessToken: function(req, res, next) {
  /*
    req.token = req.token || {};
    req.token.accessToken = jwt.sign({
      id: ... ,
      clientId: ... ,
    }, SECRET, expires);
    next();
  */
    var expires = moment().add(1, 'days').valueOf();
    var token   = jwt.encode({
      iss: req.user.username,
      exp: expires
    }, JWT_TOKEN_SECRET);
    req.token = req.token || {};
    req.token.accessToken = token;
    req.token.expires     = expires;

    next();
  },

  /*
    generateRefreshToken

      There can be more option. we can add 'permanent' flag. If that flag sets to 'false' in the url.
      no client or refresh token will be created and the session ends once the access token turns invalid.

  */
  generateRefreshToken: function(req, res, next) {
    req.token.refreshToken
      = req.user.username.toString() + ':' + crypto.randomBytes(40).toString('hex');
    db.client.storeToken({
      refreshToken: req.token.refreshToken,
      username: req.user.username
    }, next);
  }
}
