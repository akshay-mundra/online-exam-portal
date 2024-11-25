const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function updateSchema(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().email().required()
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('login schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function bulkCreateSchema(req, res, next) {
  const userObject = Joi.object({
    id: Joi.string().allow(null),
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const schema = Joi.object({
    users: Joi.array().items(userObject)
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('login schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { updateSchema, bulkCreateSchema };
