/*
  jwtauth

  This is middleware for parsing a JWT token attached to the request.
  If the token is valid, the corresponding user will be attached to the request.

  function(req, res, next, passport)

    - every parameters will given from route including 'passport'

*/
const respond = require('../helpers/respond');
const config  = require('../helpers/config');
const db      = require('../helpers/db');
const url     = require('url');
const jwt     = require('jwt-simple');
const Promise = require('promise');

module.exports = function(req, res, next) {
  /* Parse the URL */
  var parsed_url = url.parse(req.url, true);
  /*
    Take the token from

      1. the POST value accessToken
      2. the GET parameter accessToken
      3. the x-accessToken header
  */
  var token = (req.body && req.body.accessToken) || parsed_url.query.accessToken || req.headers['x-access-token'];

  if(token) {
    try {
      var decoded = jwt.decode(token, config.jwtTokenSecret);
      if(decoded.exp <= Date.now()) {
        /*
          This is access-token-expired state
          We should check refreshToken whether this is valid user
          if not, can not access this route.
        */
        respond.expired(req, res);
      }
      var _promise = function() {
        return new Promise(function (resolve, reject) {
          //
          // Where passport come from ??
          // this might casue error
          passport.authenticate('local', { session: false });

          if(req.user) resolve();
          else reject();
        });
      }
      _promise()
        .then(function() {
          console.log('success');
        }, function(err) {
          console.log(err);
        });
      passport.authenticate('local')
    }
    catch (err){
      return next();
    }
  }
  else {
    /*
      if there's no token

        later, there's no req.user so deal with that situation.
    */
    //next();
    respond.unAuthorized(req, res);
  }
}
