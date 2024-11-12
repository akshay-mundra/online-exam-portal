const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function update(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (err) {
    console.log('login schema', err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = { update };
