const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function createAnswerSchema(req, res, next) {
  const schema = Joi.object({
    questionId: Joi.string().required(),
    optionIds: Joi.array().items(Joi.string()).required()
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('login schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}
module.exports = { createAnswerSchema };
