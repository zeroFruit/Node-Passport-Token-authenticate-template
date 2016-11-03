const respond = require('../helpers/respond');

module.exports = function(req, res, next) {
  if(!req.user)
    respond.user_not_found;
  else
    next();
}
