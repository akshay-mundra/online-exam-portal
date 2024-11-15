const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

const optionSchema = Joi.object({
  option: Joi.string().required(),
  isCorrect: Joi.boolean(),
  marks: Joi.number(),
});

async function createSchema(req, res, next) {
  const schema = optionSchema;

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (err) {
    console.log('bulk create schema', err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = { createSchema, optionSchema };
