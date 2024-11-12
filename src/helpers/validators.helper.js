const commonHelpers = require('./common.helper.js');

function validateRequest(req, res, next, schema, reqParameter) {
  let requestData = {};

  if (reqParameter === 'body') {
    requestData = req.body;
  } else if (reqParameter === 'query') {
    requestData = req.query;
  } else if (reqParameter === 'params') {
    requestData = req.params;
  }

  const { value, error } = schema.validate(requestData);

  if (!error) {
    if (reqParameter === 'body') {
      req.body = value;
    } else if (reqParameter === 'query') {
      req.query = value;
    } else if (reqParameter === 'params') {
      req.params = value;
    }
    return next();
  }

  return commonHelpers.throwCustomError(error.message.replace(/"/g, ''), 422);
}

module.exports = { validateRequest };
