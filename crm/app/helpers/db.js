const pbkdf2Password = require('pbkdf2-password');
const hasher         = pbkdf2Password();
const mysql          = require('mysql');
const conn           = mysql.createConnection({
  host      : 'localhost',
  user      : 'root',
  password  : '111111',
  database  : 'crm'
});
conn.connect();
/***************************************************************************************
  What should be fixed.

    1. make respond function which deals with error handling

    2. When this app is in production, modify the logging

    3. db utils related with users/client should move to another module 'models/Users'

***************************************************************************************/
module.exports = {
  /*
    Connection, end

      connect to database or close the connection
  */
  //connection: function() {
    //conn.connect();
    //return conn;
  //},
  end: function() {
    conn.end();
  },
  /*
    Authentication

      user
        basically do two things. This is about our members
        1. After register, update the db
        2. When someone trying to login, check whether that guy is our member.

      client
        This is about who is currently accessing our website


      function:cb()
        this is callback function which is passed from passport

  */
  user: {
    /*
      updateOrCreate - exactly same as original passport serilizeUser function
    */
    updateOrCreate: function(user, cb) {
      cb(null, user);
    },

    /*
      authenticate - find user and verify password
    */
    authenticate: function(username, password, cb) {
      /*
      hashing should be done at register step */
      var sql = "SELECT * FROM users WHERE username='"+username+"'";
      conn.query(sql, function(err, results) {
        if(err) {
          console.log('query error');
          return cb(null, false);
        }

        var user = results[0]; /* query success */
        return hasher({password:password, salt:user.salt}, function(err, pass, salt, hash) {
          if(hash === user.hash) {
            console.log('LocalStrategy', user);
            cb(null, user);
          }
          else {
            cb(null, false);
          }
        });
      });
    }
  }, /* end of user */

  client: {
    /*
      updateOrCreate

        To handle multiple user, we need an identifier for each logged in client.
        After authentication of the user, we create a new client on each login.
    */
    updateOrCreate: function(data, cb) {
      var client = {
        username: data.user.username
      };
      var sql = "INSERT INTO clients (username) VALUES ('"+client.username+"');";
      conn.query(sql, client, function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('not found'));
          res.status(500);
        }
        else {
          cb(null, {username: data.user.username});
        }
      });
    },

    /*
      storeToken
    */
    storeToken: function(data, cb) {
      var sql = 'UPDATE clients SET refreshToken=? WHERE username=?';
      conn.query(sql, [data.refreshToken, data.username], function(err, results) {
        if(err) {
          console.log('query error');
          console.log(err);
          cb(new Error('not found'));
          res.status(500);
        }
        else cb();
      });
    },
    findUserOfToken: function(data, cb) {
      if(!data.refreshToken)
        return cb(new Error('invalid token'));
      var sql = 'SELECT * FROM clients WHERE refreshToken=?';

      conn.query(sql, [data.refreshToken], function(err, results) {
        if(err) {
          console.log(err);
          res.status(500);
        }
        else return cb(null, {
          username: results[0].username
        });
      });
    },
    rejectToken: function(data, cb) {
      var sql = 'UPDATE clients SET refreshToken="NULL" WHERE username=?';
      conn.query(sql, [data.username], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('not found'));
          res.status(500);
        }
        else return cb();
      });
    }
  } /* end of clients */
};
