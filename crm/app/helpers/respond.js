/*
  respond

    This module basically deals with the server response
*/
module.exports = {
  /*
    auth
  */
  auth: function(req, res) {
    // res.status(200).json({
    //   //
    //   accessToken: req.token.accessToken,
    //   expires: req.token.expires,
    //   refreshToken: req.token.refreshToken,
    //   user: req.user.username
    // });
    res.status(200).render('home');
  },

  /*
    token
  */
  token: function(req, res) {
    res.status(201).json({
      // json contain accessToken

    });
  },

  /*
    reject
  */
  reject: function(req, res) {
    res.status(204).end();
  },

  /*
    expired
  */
  expired: function(req, res) {
    res.end('Access token has expired', 205);
    /*
      instead of res.end() using next() would be possible
      but we should code that situation at later
    */
  },

  /*
    no matching user found
  */
  user_not_found: function(req, res) {
    res.status('No matching user found', 206);
    /*
      instead of res.end() using next() would be possible
      but we should code that situation at later
    */
  },

  /*
    Unauthorized
  */
  unAuthorized: function(req, res) {
    res.end('Unauthorized');
  }
}
