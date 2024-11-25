const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function roleSchema(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().min(3).required()
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('login schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { roleSchema };
