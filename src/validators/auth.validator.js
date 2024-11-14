const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function register(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    roles: Joi.array().items(Joi.string()),
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (err) {
    console.log('login schema', err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function login(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (err) {
    console.log('login schema', err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function forgotPassword(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (err) {
    console.log('login schema', err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function resetPassword(req, res, next) {
  const schema = Joi.object({
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
    userId: Joi.string().required(),
    token: Joi.string().required(),
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (err) {
    console.log('login schema', err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
