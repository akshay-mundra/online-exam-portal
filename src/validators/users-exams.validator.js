const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function createAnswerSchema(req, res, next) {
  const schema = Joi.object({
    questionId: Joi.string().required(),
    optionIds: Joi.array().items(Joi.string()).required(),
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (err) {
    console.log('login schema', err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}
module.exports = { createAnswerSchema };
